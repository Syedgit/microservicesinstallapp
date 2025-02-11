google directives 

import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  inject,
  AfterViewInit,
  PLATFORM_ID
} from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { Loader } from '@googlemaps/js-api-loader';
import { firstValueFrom } from 'rxjs';

@Directive({
  selector: '[utilGoogleMaps]'
})
export class GoogleMapsDirective implements AfterViewInit {
  @Input() options!: {
    center: { lat: number; lng: number };
    draggable?: boolean;
    zoom?: number;
  };

  @Input() mapHeight = '18.75rem';

  elementRef = inject(ElementRef);
  renderer = inject(Renderer2);
  config = inject(ConfigFacade);
  platformId = inject(PLATFORM_ID);

  heartIcon!: HTMLElement;
  apiKey!: string;

  async ngAfterViewInit() {
    this.renderer.setStyle(
      this.elementRef.nativeElement,
      'height',
      this.mapHeight
    );
    this.createMapIcon();

    if (isPlatformBrowser(this.platformId)) {
      this.apiKey = await firstValueFrom(this.config.googleMapsAPIKey$);
      this.createMap();
    }
  }

  public createMapIcon() {
    this.config.assetsBasePath$.subscribe((path) => {
      const logoPath = path + '/blocks/store-locator/cvs.png';

      this.heartIcon = this.renderer.createElement('img');
      this.renderer.setAttribute(this.heartIcon, 'src', logoPath);
      this.renderer.setAttribute(this.heartIcon, 'alt', 'cvs-heart-image');
    });
  }

  public async createMap() {
    const loader = new Loader({
      apiKey: this.apiKey,
      version: 'weekly'
    });

    const googleMaps = await loader.importLibrary('maps');

    const { AdvancedMarkerElement } = await loader.importLibrary('marker');

    const map = new googleMaps.Map(this.elementRef.nativeElement, {
      zoom: this.options.zoom ?? 14,
      ...this.options,
      mapId: 'CVS-MAP'
    });

    const marker = new AdvancedMarkerElement({});

    marker.map = map;
    marker.position = this.options.center;
    marker.content = this.heartIcon;
  }
}

pharmacy-map.html

@if (store && options) {
  <div class="map-container">
    <ps-label>Store #{{ store.id }}</ps-label>
    <h3>
      {{ store.address.line[0] | titlecase }},
      <span class="break-line"></span>
      {{ store.address.city | titlecase }},
      {{ store.address.state | uppercase }},
      {{ store.address.postalCode | titlecase }}
    </h3>
    <div utilGoogleMaps [options]="options"></div>
    <div class="directions-container">
      <svg
        width="21"
        height="22"
        viewBox="0 0 21 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20.5528 0.943778C20.3278 0.733778 20.0578 0.613778 19.7128 0.583778C19.3678 0.553778 18.9928 0.628778 18.5878 0.823778L0.947784 8.99878C0.632784 9.13378 0.407784 9.32878 0.257784 9.55378C0.107784 9.77878 0.0177839 10.0188 0.00278387 10.2738C-0.0122161 10.5288 0.0327839 10.7538 0.152784 10.9788C0.272784 11.2038 0.437784 11.3838 0.677784 11.5338C0.902784 11.6838 1.18778 11.7588 1.51778 11.7588L9.55778 11.7888C9.55778 11.7888 9.66278 11.7888 9.69278 11.8188C9.70778 11.8338 9.72278 11.8788 9.72278 11.9538V19.9338C9.73778 20.2788 9.81278 20.5638 9.96278 20.8038C10.1128 21.0288 10.2928 21.2088 10.5328 21.2988C10.7578 21.4038 11.0128 21.4338 11.2678 21.4188C11.5228 21.3888 11.7778 21.2988 12.0028 21.1188C12.2278 20.9388 12.4228 20.6988 12.5728 20.3838L20.7328 2.86378C20.9128 2.45878 20.9878 2.09878 20.9428 1.75378C20.8978 1.40878 20.7628 1.15378 20.5528 0.943778ZM19.2628 2.36878L11.3578 19.5288C11.3578 19.5288 11.2978 19.5588 11.2828 19.5588C11.2678 19.5588 11.2378 19.5438 11.2378 19.5138L11.2978 11.0688C11.2978 10.7988 11.2678 10.5888 11.1028 10.4238C10.9378 10.2588 10.7128 10.1688 10.4428 10.1688L1.63778 10.2138C1.63778 10.2138 1.59278 10.2138 1.59278 10.1838C1.59278 10.1688 1.59278 10.1538 1.63778 10.1388L19.1728 2.29378C19.1728 2.29378 19.2478 2.27878 19.2628 2.29378C19.2778 2.29378 19.2778 2.33878 19.2628 2.38378V2.36878Z"
          fill="#004D99" />
      </svg>

      @if (store.position.latitude && store.position.longitude) {
        <ps-link
          subtype="emphasized"
          [isNewTab]="true"
          [linkHref]="externalMapHref"
          aria-label="Google search - link opens in a new tab"
          rel="noopener noreferrer"
          >Get directions</ps-link
        >
      }
    </div>
  </div>
} @else {
  <util-spinning-loader [loading]="true" />
}


pharmacy-componene


  import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { SpinningLoaderComponent } from '@digital-blocks/angular/core/components';
import { GoogleMapsDirective } from '@digital-blocks/angular/core/util/directives';
import { StoreLocatorFacade } from '@digital-blocks/angular/main/store-locator/store/store-locator';
import { Store } from '@digital-blocks/angular/main/store-locator/util/models';
import { BehaviorSubject, combineLatest, of } from 'rxjs';

import { PharmacyMapStore } from './pharmacy-map.store';

@Component({
  selector: 'lib-pharmacy-map',

  imports: [CommonModule, GoogleMapsDirective, SpinningLoaderComponent],
  templateUrl: 'pharmacy-map.component.html',
  styleUrls: ['pharmacy-map.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PharmacyMapStore],
  host: { ngSkipHydration: 'true' }
})
export class PharmacyMapComponent implements OnInit {
  @Input() public googleURL!: string; // Keystone input
  @Input() public store$!: BehaviorSubject<Store | undefined>; // Regular input
  @Input() public isModal!: boolean; // Regular input
  @Input() public externalMapHref!: string; // Regular input
  @Output() public createPlatFormSpecificURL = new EventEmitter<{
    baseURL: string;
    lat: string;
    long: string;
  }>();

  private readonly activatedRoute = inject(ActivatedRoute);
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly storeLocatorFacade = inject(StoreLocatorFacade);

  store: Store | undefined;

  options:
    | {
        center: { lat: number; lng: number };
        draggable?: boolean;
        zoom?: number;
      }
    | undefined = undefined;

  public ngOnInit(): void {
    combineLatest([
      this.activatedRoute.queryParams,
      this.storeLocatorFacade.nearByStores$,
      this.store$ ?? of(null) // If passed undefined when component is used as a page
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([queryParameter, nearByStores, store]) => {
        const storeId =
          this.isModal && store?.id ? store.id : queryParameter['storeId'];

        this.store = nearByStores.find((store) => store.id === storeId);
        if (!this.options && this.store) {
          this.options = {
            center: {
              lat: Number(this.store.position.latitude),
              lng: Number(this.store.position.longitude)
            }
          };
        }
        if (this.store?.position.latitude && this.store.position.longitude) {
          this.createPlatFormSpecificURL.emit({
            baseURL: this.googleURL,
            lat: this.store.position.latitude,
            long: this.store.position.longitude
          });
        }
      });
  }
}

this is how it is being used in other pharmacy detail page 

 <lib-pharmacy-map
    [googleURL]="googleURL"
    [isModal]="isModal"
    [store$]="store$"
    [externalMapHref]="externalMapHref"
    (createPlatFormSpecificURL)="createPlatFormSpecificURL.emit($event)" />

