import {
  CommonModule,
  isPlatformBrowser,
  TitleCasePipe
} from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Input
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpinningLoaderComponent } from '@digital-blocks/angular/core/components';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { TrackerStatusComponent } from '@digital-blocks/angular/delivery/tracker/components';
import {
  DeliveryTrackerContent,
  EventServerResponse,
  EventTrackingUpdatesResponse,
  GoogleMapOptions,
  GoogleMapOptionsCenter,
  LiveTrackerFacade,
  LiveTrackerModule,
  TrackingUpdates
} from '@digital-blocks/angular/delivery/tracker/store/live-tracker';
import { GoogleMapsDirective } from '@digital-blocks/angular/delivery/tracker/util/directives';
import {
  CapitalizePipe,
  TrackingUpdateDateTimePipe
} from '@digital-blocks/angular/delivery/tracker/util/pipes';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  retry,
  Subject,
  switchMap,
  take,
  takeUntil,
  timer
} from 'rxjs';

/**
 * @class LiveTrackerComponent
 *
 * @description To gather details on a carrier, display that data, gather active location details, and display appropriate delivery information
 *
 * - The first api call is to gather the current event. If the appropriate event is active, the delivery location api will be called
 * - The delivery location api will gather the text responses from the SSE endpoint, parse the data, and serialize the correct details
 * - After 10 mins, the subscription will be cancelled and a new subscription will occur, a notification will then be shown to the user on the UI
 *
 * @content { Record<string, string> } page definition constant hard coded data
 * @var { Subject<void> } destroyable used to unsubscribe from all subscriptions within this component
 * @var { string } trackingId !REQUIRED! gathered from the query parameters, used to gather the delivery details
 *
 * @imports GoogleMapsDirective, SpinningLoaderComponent, TrackerStatusComponent
 */
@Component({
  selector: 'lib-live-tracker',

  imports: [
    CommonModule,
    LiveTrackerModule,
    CapitalizePipe,
    TrackingUpdateDateTimePipe,
    GoogleMapsDirective,
    SpinningLoaderComponent,
    TrackerStatusComponent
  ],
  templateUrl: 'live-tracker.component.html',
  styleUrls: ['live-tracker.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [TitleCasePipe],
  host: { ngSkipHydration: 'true' }
})
export class LiveTrackerComponent implements OnInit, OnDestroy {
  /** page definition input variables */
  @Input() content!: DeliveryTrackerContent;

  /** injections */
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly config = inject(ConfigFacade);
  private readonly platformId = inject(PLATFORM_ID);
  protected facade = inject(LiveTrackerFacade);

  /** component variables */
  protected blob: Blob | null = null;
  protected blobUrl = '';
  protected htmlNaN = Number.NaN;
  protected isBlobOpen = false;
  protected orderId = '';
  protected trackingId = '';

  /** reactive variables */
  protected destroyable: Subject<void> = new Subject<void>();
  protected streamDestroyable: Subject<void> = new Subject<void>();
  protected showNotification$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  protected excessiveTimer!: Observable<number>;
  protected notificationTimer!: Observable<number>;
  protected refreshTimer!: Observable<number>;
  protected path!: string;
  protected disableMapAfterDelivered = false;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupTimers();
      this.triggerExcessiveTimer();

      this.config.assetsBasePath$.pipe(take(1)).subscribe((domain) => {
        this.path = `${domain}/blocks/orderdetail/svgs/home_delivery.svg`;
      });

      /** to gather the details about the driver and current progress */
      this.activatedRoute.queryParams
        .pipe(
          take(1),
          filter((parameters) => parameters['trackingId'])
        )
        .subscribe((parameters) => {
          this.trackingId = parameters['trackingId'];

          if (this.trackingId)
            this.facade.getDriverDetailEvents(this.trackingId);
        });

      /** Server side events, analyzes the chunked string data, parses, and stores appropriate events from data */
      combineLatest([
        this.facade.deliverySubject$.pipe(distinctUntilChanged()),
        timer(0, this.facade.timerLimits.refresh)
      ])
        .pipe(
          switchMap(([inProgress, value]) => {
            this.cancelExistingSubscription(value);

            return this.handleObservableStreams(inProgress, value);
          }),
          takeUntil(this.destroyable)
        )
        .subscribe({
          next: (response) => {
            if (response) this.handleSSE(response);
          },
          error: (error: unknown) => console.warn(`${error}`),
          complete: () => {
            this.stop();
          }
        });

      /** once the img is in state, pull, make api call, set blob to comp if exists, if not, failover to null */
      this.facade.imageUrl$
        .pipe(
          take(1),
          switchMap((imgUrl) => {
            return this.facade.getImgUrl(imgUrl).pipe(take(1));
          }),
          catchError(() => {
            console.warn(
              'There was an issue with the url provided or authorization for the delivery image'
            );

            return of(null);
          })
        )
        .subscribe((response) => {
          if (response) {
            this.blob = response;
            this.blobUrl = URL.createObjectURL(this.blob);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.stop();
    if (this.blob) {
      this.blob = null;
      URL.revokeObjectURL(this.blobUrl);
    }
  }

  private setupTimers(): void {
    this.excessiveTimer = timer(
      this.content.timers?.excessive ?? this.facade.timerLimits.excessive
    );
    this.notificationTimer = timer(
      this.content.timers?.notification ?? this.facade.timerLimits.notification
    );
    this.refreshTimer = timer(
      0,
      this.content.timers?.refresh ?? this.facade.timerLimits.refresh
    );
  }

  protected handleBlob(): void {
    const overlay = document.querySelector('.overlay') as HTMLElement;

    this.isBlobOpen = !this.isBlobOpen;
    overlay.style.display = `${this.isBlobOpen ? 'flex' : 'none'}`;
  }

  private cancelExistingSubscription(value: number, retrigger = true): void {
    if (value > 0) {
      /** manually cancel the active subscription via streamDestroyable if timer has emitted more than once, reinitialize before new api call */
      this.streamDestroyable.next();
      this.streamDestroyable.complete();
      if (retrigger) {
        this.streamDestroyable = new Subject<void>();
      }
    }
  }

  private handleObservableStreams(
    inProgress: boolean,
    value: number
  ): Observable<string> {
    /** if inProgress is false, the order has been delivered */
    if (!inProgress) this.stop();

    if (value >= 0) {
      return this.facade.getDriverLocationDetails(this.trackingId).pipe(
        map(
          (response) => (response as unknown as EventServerResponse).partialText
        ),
        catchError(() => of('')),
        takeUntil(this.streamDestroyable)
      );
    }

    return of('');
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity -- override for the moment
  private handleSSE(response: string): void {
    const matches: string[] = (
      (response || '').match(/{[^]*?}(?=\s*--graphql)/gi) ?? []
    ).reverse();

    for (const element of matches) {
      try {
        const _element = JSON.parse(element.toLowerCase()) ?? {};

        if (Object.keys(_element).length > 0) {
          const data: EventTrackingUpdatesResponse = _element;

          const updates: TrackingUpdates =
            data.payload?.data?.subscribetotrackingdetails;

          const location = this.getLocations(updates);

          /** if reloadneeded is true, make load call once more to gather current events */
          if (updates?.reloadneeded) {
            this.disableMapAfterDelivered = true;
            this.facade.getDriverDetailEvents(this.trackingId);
          }

          if (updates?.itemdelivered) {
            this.facade.deliverySubject$.next(false);
            this.facade.setActiveStageId('1002');
            if (!updates?.reloadneeded) {
              this.facade.pushDeliveredEvent();
            }
          }

          const updatedDriverOptions = this.testDriverOptions(location);

          if (updatedDriverOptions) {
            this.facade['driverOptions'].next({
              center: {
                lat: Number(location.lat),
                lng: Number(location.lng)
              }
            });
          }

          break;
        } else {
          break;
        }
      } catch {
        break;
      }
    }
  }

  private getLocations(updates: TrackingUpdates): {
    lat: number;
    lng: number;
  } {
    return {
      lat: updates?.latitude ? Number(updates?.latitude) : Number.NaN,
      lng: updates?.longitude ? Number(updates?.longitude) : Number.NaN
    };
  }

  private testDriverOptions(location: GoogleMapOptionsCenter): boolean {
    return !Number.isNaN(location.lat) && !Number.isNaN(location.lng);
  }

  /** @description completes the subject, cancelling all subscriptions */
  private stop(): void {
    this.destroyable.next();
    this.destroyable.complete();
    this.cancelExistingSubscription(1, false);
  }

  /** @description To cancel all subscriptions on the UI if the user is connected, actively, for 30 mins */
  private triggerExcessiveTimer(): void {
    this.excessiveTimer
      .pipe(takeUntil(this.destroyable))
      .subscribe(() => this.stop());
  }

  protected get isLatLngNaN(): boolean {
    let option: GoogleMapOptions | null = null;

    this.facade.options$.pipe(take(1)).subscribe((_option) => {
      option = _option;
    });

    return !Number.isNaN(
      (option as unknown as GoogleMapOptions)?.center?.lat ?? Number.NaN
    );
  }
}


html 


@if ((facade.loading$ | async) !== true) {
  <section class="delivery-tracker">
    @if (this.facade.orderNumber) {
      <h2 class="order-id flexd">Order # {{ this.facade.orderNumber }}</h2>
    }
    <!-- add the method, triggerNotificationTimer, to any logic you want to display the notification for -->
    <!-- the header and message must be set in the page definition, and just uncomment the code below -->

    <!-- @if ((showNotification$ | async) === true) {
      <ps-important-note has-close="true" is-open="true" variant="info">
        <h2 slot="heading">{{ content.subscription.header }}</h2>
        <p>{{ content.subscription.message }}</p>
      </ps-important-note>
    } -->

    @if (this.blobUrl && this.isBlobOpen) {
      <div class="overlay" [ngClass]="isBlobOpen ? ' show' : ' hide'">
        <ps-card variant="two-column" border="outlined">
          <div slot="body">
            <img slot="media" [src]="blobUrl" alt="Delivery" />
          </div>
          <ps-button
            slot="footer"
            size="sm"
            variant="text"
            (click)="handleBlob()"
            (keypress)="handleBlob()"
            >Close delivery photo</ps-button
          >
        </ps-card>
      </div>
    }

    @if ((facade.deliveryCancelled$ | async) === null) {
      @if (facade.trackerStatus$ | async; as trackerStatus) {
        <util-tracker-status
          [trackerStatus]="trackerStatus"></util-tracker-status>
      }

      <div
        utilGoogleMaps
        class="google-map"
        [ngStyle]="{
          display:
            disableMapAfterDelivered ||
            ((facade.atPickupInitialized$ | async) !== null &&
              !isLatLngNaN &&
              (facade.deliveryConfirmed$ | async) !== null)
              ? 'none'
              : 'display'
        }"
        [delivered]="facade.deliverySubject$ | async"
        [options]="facade.options$ | async"
        [driverOptionsInput]="facade.driverOptions$ | async"></div>
    }

    <div class="information">
      <div class="driver flexd">
        <div class="details flexd">
          <img
            slot="media"
            [width]="'110'"
            [height]="'88'"
            [src]="path"
            alt="A delivery driver" />
          <span class="position">{{ content.yourDriverText }}</span>
          <h3 class="name">
            {{ (facade.driverDetails$ | async)?.driverName | capitalize: true }}
          </h3>
          <p class="vehicle">
            {{
              (facade.driverDetails$ | async)?.driverVehicle?.color | capitalize
            }}
            <span class="license-plate">
              {{
                (facade.driverDetails$ | async)?.driverVehicle?.make
                  | capitalize
              }}
              {{
                (facade.driverDetails$ | async)?.driverVehicle?.model
                  | capitalize
              }}</span
            >
          </p>
        </div>
      </div>
      <div class="delivery-updates flexd">
        <ps-tile border="outlined">
          <div class="heading flexd">
            <span class="title">{{ content.trackingUpdatesText }}</span>
            <span class="unique-identifier">{{ trackingId }}</span>
          </div>

          @if (facade.events$ | async; as _events) {
            @if (facade.deliveryCancelled$ | async; as cancelled) {
              <hr />
              <div class="events">
                <span class="status">Delivery cancelled</span>
                <div class="time-frame-and-button">
                  <span class="timeframe">{{
                    cancelled.trackingEventDateTime | trackingdatetime
                  }}</span>
                </div>
              </div>
            }

            @if (facade.deliveryConfirmed$ | async; as delivered) {
              <hr />
              <div class="events">
                <span class="status">{{
                  content.updateHeadings.deliveryConfirmed
                }}</span>
                <div class="time-frame-and-button flexd">
                  <span class="timeframe">{{
                    delivered.trackingEventDateTime | trackingdatetime
                  }}</span>

                  @if (blobUrl) {
                    <ps-button
                      size="sm"
                      variant="text"
                      (click)="handleBlob()"
                      (keypress)="handleBlob()"
                      >View delivery photo</ps-button
                    >
                  }
                </div>
              </div>
            }

            @if (
              facade.deliveryDetailsAdded$ | async;
              as deliveryDetailsAdded
            ) {
              <hr />
              <div class="events">
                <span class="status">{{
                  content.updateHeadings.deliveryDetailsAdded
                }}</span>
                <span class="timeframe">{{
                  deliveryDetailsAdded.trackingEventDateTime | trackingdatetime
                }}</span>
              </div>
            }

            @if (facade.atPickup$ | async; as atPickup) {
              <hr />
              <div class="events">
                <span class="status">{{
                  content.updateHeadings.pickupConfirmed
                }}</span>
                <span class="timeframe">{{
                  atPickup.trackingEventDateTime | trackingdatetime
                }}</span>
              </div>
            }

            @if (facade.createdAck$ | async; as created) {
              <hr />
              <div class="events">
                <span class="status">{{
                  content.updateHeadings.gigCreated
                }}</span>
                <span class="timeframe">{{
                  created?.trackingEventDateTime | trackingdatetime
                }}</span>
              </div>
            }
          }
        </ps-tile>
      </div>
    </div>
  </section>
} @else {
  <util-spinning-loader [loading]="true" />
}
