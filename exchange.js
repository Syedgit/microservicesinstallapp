store-locator.html

<util-conditional-modal
  [showAsModal]="isModal"
  size="lg"
  #conditionalModal
  [extraWide]="(layoutFacade.breakpointSmall$ | async) === false"
  (afterCloseEvent)="handleAfterClose()"
  [heading]="staticcontent.storeLocatorContentText.detailTitle">
  <lib-digital-blocks-store-locator-details
    [isModal]="isModal"
    [googleURL]="staticcontent.googleURL"
    [storeLocatorContentText]="staticcontent.storeLocatorContentText"
    [pharmacyDetailsPath]="pharmacyDetailsPath"
    [externalMapHref]="externalMapHref"
    (createPlatFormSpecificURL)="createPlatFormSpecificURL($event)"
    (closeModal)="closeModal()"
    (showPharmacyDetails)="showPharmacyDetails($event)" />
</util-conditional-modal>

<lib-pharmacy-details
  [isModal]="true"
  [googleURL]="staticcontent.googleURL"
  [pharmacyDetails]="staticcontent.storeLocatorContentText.pharmacyDetails"
  [store$]="pharmacyDetailsStore$"
  [externalMapHref]="externalMapHref"
  (createPlatFormSpecificURL)="createPlatFormSpecificURL($event)"
  (handleBackClick)="handleBackClick()"
  (closeLocatorModal)="closeModal()" />


store-locator.components.ts

import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  Input,
  ViewChild
} from '@angular/core';
import { ConditionalModalComponent } from '@digital-blocks/angular/core/components';
import { LayoutFacade } from '@digital-blocks/angular/core/store/layout';
import { UserAnalyticsFacade } from '@digital-blocks/angular/core/store/user-analytics';
import {
  DeviceType,
  getDeviceType
} from '@digital-blocks/angular/core/util/helpers';
import {
  StoreLocatorFacade,
  AdobeConstants
} from '@digital-blocks/angular/main/store-locator/store/store-locator';
import { Store } from '@digital-blocks/angular/main/store-locator/util/models';
import { PharmacyDetailsComponent } from '@digital-blocks/angular/pharmacy/shared/blocks/pharmacy-details';
import {
  CartFacade,
  CartModule
} from '@digital-blocks/angular/pharmacy/shared/store/cart';
import { BehaviorSubject } from 'rxjs';

import { StoreLocatorDetailsComponent } from './store-locator-details/store-locator-details.component';
import { StoreLocatorStore } from './store-locator.store';

@Component({
  selector: 'lib-store-locator',
  imports: [
    CommonModule,
    StoreLocatorDetailsComponent,
    ConditionalModalComponent,
    PharmacyDetailsComponent,
    CartModule
  ],
  templateUrl: 'store-locator.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './store-locator.component.scss',
  providers: [StoreLocatorStore, StoreLocatorFacade],
  host: { ngSkipHydration: 'true' }
})
export class StoreLocatorComponent {
  @Input() public isModal = false; // Regular Input
  @Input() public pharmacyDetailsPath = '';
  @Input() public staticcontent = {
    googleURL: '',
    storeLocatorContentText: {
      pharmacyDetails: '',
      detailTitle: '',
      detailInfoText: '',
      detailInfoTextOrdersPre: '',
      detailInfoTextOrdersPost: '',
      detailLabel: '',
      choosePharmacyLabel: '',
      searchDisclaimer: '',
      showMoreLocationsButton: '',
      confirmLocationButton: '',
      noResultsFound: '',
      noStoresAvailable: '',
      storesNotFound: '',
      errorHeading: '',
      errorNote: '',
      noTransferToAnotherStore: '',
      noTransferPrescriptions: '',
      stopBy: ''
    },
    config: {
      nearbyStoresCurrentShown: 5,
      nearbyStoresCount: 0,
      incrementCount: 5
    }
  };

  @ViewChild(ConditionalModalComponent)
  public conditionalModal!: ConditionalModalComponent;
  @ViewChild(PharmacyDetailsComponent)
  pharmacyDetailsComponent!: PharmacyDetailsComponent;
  @ViewChild(StoreLocatorDetailsComponent)
  storeLocatorDetailsComponent!: StoreLocatorDetailsComponent;
  protected readonly store = inject(StoreLocatorStore);
  protected readonly userAnalyticsFacade = inject(UserAnalyticsFacade);
  protected readonly layoutFacade = inject(LayoutFacade);
  protected readonly storeLocatorFacade = inject(StoreLocatorFacade);
  public readonly cartFacade = inject(CartFacade);
  public platform = getDeviceType();

  public modalOpen = false;
  public pharmacyDetailsModalOpen = false;
  public pharmacyDetailsStore$ = new BehaviorSubject<Store | undefined>(
    undefined
  );
  public externalMapHref = '';

  public showModal() {
    this.conditionalModal.showModal();
    this.modalOpen = true;
    if (this.isModal) this.storeLocatorDetailsComponent.focusHeader();
    this.userAnalyticsFacade.viewEvent(
      AdobeConstants.STORE_LOCATOR_PAGE.PAGE_LOAD.page_name
    );
  }

  public closeModal() {
    this.conditionalModal.closeModal();
    this.modalOpen = false;
  }

  public handleBackClick() {
    this.pharmacyDetailsComponent.closeModal();
  }
  public handleAfterClose() {
    this.storeLocatorDetailsComponent.storeLocatorGroup.patchValue({
      term: this.storeLocatorDetailsComponent.initialZipcode
    });
  }

  public showPharmacyDetails(store: Store) {
    this.pharmacyDetailsStore$.next(store);
    this.pharmacyDetailsComponent.showModal();
    this.pharmacyDetailsModalOpen = true;
  }

  public createPlatFormSpecificURL(payload: {
    baseURL: string;
    lat: string;
    long: string;
  }): void {
    if (
      this.platform === DeviceType.IOS_MOBILE ||
      this.platform === DeviceType.IOS_TABLET
    ) {
      this.externalMapHref = `comgooglemaps://?q=${payload.baseURL}${payload.lat},${payload.long}`;

      return;
    }

    if (
      this.platform === DeviceType.ANDROID_MOBILE ||
      this.platform === DeviceType.ANDROID_TABLET
    ) {
      this.externalMapHref = `geo:0,0?q=${payload.baseURL}${payload.lat},${payload.long}`;

      return;
    }

    this.externalMapHref = `${payload.baseURL}${payload.lat},${payload.long}`;
  }
}


store-locator.actions.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import {
  NearestEligibleStoresProperties,
  FavoriteSpecialtyStore,
  NearestFulfillingStoreProperties,
  PrescriptionTransferEligibility,
  Store,
  StoreDetails
} from '@digital-blocks/angular/main/store-locator/util/models';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const StoreLocatorActions = createActionGroup({
  source: 'StoreLocator',
  events: {
    'Edit SelectedStore': props<{ selectedStore: string }>(),

    'Get StoresByZipcode': props<{ zipCode: string }>(),
    'Get StoresByZipcode Success': props<{ nearByStores: Store[] }>(),
    'Get StoresByZipcode Failure': props<{ error: ReportableError }>(),

    'Update StoreLocatorZipcode': props<{ zipCode: string }>(),
    'Update OnConfirmRoute': props<{ onConfirmRoute: string }>(),
    'Update PreviousPage': props<{ previousPage: string }>(),
    'Update NearestFulfillingStoreProps': props<{
      nearestFulfillingStoreProps: NearestFulfillingStoreProperties;
    }>(),
    'Update CurrentStoreDetails': props<{
      currentStoreDetails: StoreDetails;
    }>(),

    'Get NearestEligibleStores': props<{
      nearestEligibleStoresProps: NearestEligibleStoresProperties;
      searchTerm?: string;
    }>(),
    'Get NearestEligibleStores Success': props<{
      nearByStores: Store[];
      withinRadiusStores: Store[];
      nearestEligibleStoresProps: NearestEligibleStoresProperties | undefined;
    }>(),
    'Get NearestEligibleStores Failure': props<{ error: ReportableError }>(),

    'Get StoresByStoreIds': props<{ storeIds: string[] }>(),
    'Get StoresByStoreIds Success': props<{ nearByStores: Store[] }>(),
    'Get StoresByStoreIds Failure': props<{ error: ReportableError }>(),

    'Get NearestFulfillingStore': props<{
      fulfillmentProps: NearestFulfillingStoreProperties;
      searchTerm?: string;
    }>(),
    'Get NearestFulfillingStore Success': props<{
      nearestFulfillingStore: PrescriptionTransferEligibility | undefined;
      nearestIneligibleStore: PrescriptionTransferEligibility | undefined;
      nearByStores: Store[];
      withinRadiusStores: Store[];
    }>(),
    'Get NearestFulfillingStore Failure': props<{ error: ReportableError }>(),

    'Get StoresBySearchText': props<{ text: string }>(),
    'Get StoresBySearchText Success': props<{ nearByStores: Store[] }>(),
    'Get StoresBySearchText Failure': props<{ error: ReportableError }>(),

    'Get SpecialtyStoresBySearchText': props<{ text: string }>(),
    'Get SpecialtyStoresBySearchText Success': props<{
      nearByStores: Store[];
    }>(),
    'Get SpecialtyStoresBySearchText Failure': props<{
      error: ReportableError;
    }>(),

    'Set ClosedStore': props<{ closedStoreNumbers: string[] }>(),

    'Get Favorite Specialty Store': emptyProps(),
    'Get Favorite Specialty Store Success': props<{
      favoriteSpecialtyStore: FavoriteSpecialtyStore;
    }>(),
    'Get Favorite Specialty Store Failure': props<{ error: ReportableError }>(),
    'Set Ineligibility Reason': props<{
      ineligibilityReason: string | undefined;
    }>(),
    'Reset State': emptyProps()
  }
});


effects.ts

import { inject, Injectable } from '@angular/core';
import { errorMessage } from '@digital-blocks/angular/core/util/error-handler';
import { XidCampaignInfoFacade } from '@digital-blocks/angular/pharmacy/shared/store/xid-campaign-info';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  catchError,
  exhaustMap,
  forkJoin,
  map,
  mergeMap,
  of,
  switchMap,
  take
} from 'rxjs';

import { StoreLocatorService } from '../services';
import {
  NearestEligibleStoresUtils,
  TransferEligibilityUtils,
  StoreLocatorUtils
} from '../services/store-locator.utils.service';

import { StoreLocatorActions } from './store-locator.actions';

@Injectable()
export class StoreLocatorEffects {
  private readonly actions$ = inject(Actions);
  private readonly storeLocatorService = inject(StoreLocatorService);
  private readonly nearestEligibleStoresUtils = inject(
    NearestEligibleStoresUtils
  );
  private readonly transferEligiblityUtils = inject(TransferEligibilityUtils);
  private readonly storeLocatorUtils = inject(StoreLocatorUtils);
  public readonly xidCampaignInfoFacade = inject(XidCampaignInfoFacade);

  private readonly errorTag = 'StoreLocatorEffects';

  public getStoresByZipcode$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreLocatorActions.getStoresByZipcode),
      switchMap(({ zipCode }) => {
        return this.storeLocatorService.getStoresByZipcode(zipCode).pipe(
          map((response) => {
            const cleanStores = this.storeLocatorUtils.cleanData(
              response.data.storesByZipCode ?? []
            );
            const filteredStores =
              this.storeLocatorUtils.filterBannerBrandStores(cleanStores);

            return StoreLocatorActions.getStoresByZipcodeSuccess({
              nearByStores: filteredStores
            });
          }),
          catchError((error: unknown) => {
            return of(
              StoreLocatorActions.getStoresByZipcodeFailure({
                error: errorMessage(this.errorTag, error)
              })
            );
          })
        );
      })
    );
  });

  public getStoresByStoreIds$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreLocatorActions.getStoresByStoreIds),
      exhaustMap(({ storeIds }) => {
        return this.storeLocatorService.getStoresByStoreIds(storeIds).pipe(
          take(1),
          mergeMap((response) => {
            const cleanStores = this.storeLocatorUtils.cleanData(
              response.data.storesByStoreIds ?? []
            );

            const closedStoreNumbers = this.storeLocatorUtils.filterClosedStore(
              storeIds,
              response
            );
            const filteredStores =
              this.storeLocatorUtils.filterBannerBrandStores(cleanStores);

            return of(
              StoreLocatorActions.getStoresByStoreIdsSuccess({
                nearByStores: filteredStores
              }),
              StoreLocatorActions.setClosedStore({
                closedStoreNumbers
              })
            );
          }),
          catchError((error: unknown) => {
            return of(
              StoreLocatorActions.getStoresByStoreIdsFailure({
                error: errorMessage(this.errorTag, error)
              })
            );
          })
        );
      })
    );
  });

  public getStoresBySearchText$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreLocatorActions.getStoresBySearchText),
      switchMap(({ text }) => {
        return this.storeLocatorService.getStoresBySearchText(text).pipe(
          map((response) => {
            const cleanStores = this.storeLocatorUtils.cleanData(
              response.data.storesBySearchText ?? []
            );
            const filteredStores =
              this.storeLocatorUtils.filterBannerBrandStores(cleanStores);

            return StoreLocatorActions.getStoresBySearchTextSuccess({
              nearByStores: filteredStores
            });
          }),
          catchError((error: unknown) => {
            return of(
              StoreLocatorActions.getStoresBySearchTextFailure({
                error: errorMessage(this.errorTag, error)
              })
            );
          })
        );
      })
    );
  });

  // This function will filter the stores by the search text and return the stores that are specialty stores
  public getSpecialtyStoresBySearchText$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreLocatorActions.getSpecialtyStoresBySearchText),
      switchMap(({ text }) => {
        return this.storeLocatorService
          .getSpecialtyStoresBySearchText(text)
          .pipe(
            map((response) => {
              const cleanStores = this.storeLocatorUtils.cleanData(
                response.data.storesBySearchText ?? []
              );

              const filterSpecialtyStores =
                this.storeLocatorUtils.getSpecialtyStoresOnly(cleanStores);

              return StoreLocatorActions.getSpecialtyStoresBySearchTextSuccess({
                nearByStores: filterSpecialtyStores
              });
            }),
            catchError((error: unknown) => {
              return of(
                StoreLocatorActions.getSpecialtyStoresBySearchTextFailure({
                  error: errorMessage(this.errorTag, error)
                })
              );
            })
          );
      })
    );
  });

  // Mainly used for the orders page.
  public getNearestFulfillingStore$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreLocatorActions.getNearestFulfillingStore),
      switchMap(({ fulfillmentProps, searchTerm }) => {
        return this.storeLocatorService
          .getStoresBySearchText(
            searchTerm ?? fulfillmentProps?.fromStoreAddress?.postalCode ?? '',
            fulfillmentProps.radius,
            fulfillmentProps.pageNum,
            fulfillmentProps.resultsPerPage,
            fulfillmentProps.maxItemsInResult
          )
          .pipe(
            switchMap((response) => {
              const cleanStores = this.storeLocatorUtils.cleanData(
                response.data.storesBySearchText ?? []
              );
              const stores =
                this.storeLocatorUtils.filterBannerBrandStores(cleanStores);

              // Remove the fromStore from the list of stores since we cannot transfer to the same store
              const filteredStores = stores.filter(
                (store) =>
                  Number(store.id) !== Number(fulfillmentProps.fromStoreId)
              );

              return this.transferEligiblityUtils.fetchRxTransferAndInventory(
                fulfillmentProps,
                filteredStores,
                cleanStores
              );
            }),
            switchMap(
              ({
                eligibleStoreDetails,
                fulfillmentProperties,
                matchedEligibleStores,
                matchedIneligibleStores,
                withinRadiusStores
              }) => {
                const nearestFulfillingStore = matchedEligibleStores?.[0];
                const nearestIneligibleStore = matchedIneligibleStores?.[0];

                return of(
                  StoreLocatorActions.getNearestFulfillingStoreSuccess({
                    nearByStores: eligibleStoreDetails,
                    nearestIneligibleStore,
                    nearestFulfillingStore,
                    withinRadiusStores
                  }),
                  StoreLocatorActions.updateNearestFulfillingStoreProps({
                    nearestFulfillingStoreProps: fulfillmentProperties
                  })
                );
              }
            ),
            catchError((error: unknown) => {
              return of(
                StoreLocatorActions.getNearestFulfillingStoreFailure({
                  error: errorMessage(this.errorTag, error)
                })
              );
            })
          );
      })
    );
  });

  // This effect generated an array of stores that are eligible for transfer for all the RXs
  public getNearestEligibleStores$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreLocatorActions.getNearestEligibleStores),
      switchMap(({ nearestEligibleStoresProps, searchTerm }) => {
        return this.storeLocatorService
          .getStoresBySearchText(
            searchTerm ??
              nearestEligibleStoresProps.searchByTextProps.searchTerm,
            nearestEligibleStoresProps.searchByTextProps.radius,
            nearestEligibleStoresProps.searchByTextProps.pageNum,
            nearestEligibleStoresProps.searchByTextProps.resultsPerPage,
            nearestEligibleStoresProps.searchByTextProps.maxItemsInResult
          )
          .pipe(
            map((response) => {
              return {
                nearestStores: this.storeLocatorUtils.cleanData(
                  response.data.storesBySearchText ?? []
                ),
                nearestEligibleStoresProps
              };
            }),
            catchError((error: unknown) => {
              return of({ error });
            })
          );
      }),
      switchMap((response) => {
        if ('error' in response) {
          return of(
            StoreLocatorActions.getNearestEligibleStoresFailure({
              error: errorMessage(this.errorTag, response.error)
            })
          );
        } else {
          // Create an observable array from prescriptions
          const prescriptionObservables$ =
            this.nearestEligibleStoresUtils.createObservableArray(response);

          return forkJoin(prescriptionObservables$).pipe(
            switchMap(async (responses) => {
              // Fetch eligible stores for each prescription and store unique stores only
              await this.nearestEligibleStoresUtils.populateEligibleStores(
                responses
              );

              // Get stores that matches the Store interface (Normalize data)
              const normalizedStores =
                this.nearestEligibleStoresUtils.normalizeStores(
                  response.nearestStores
                );

              return StoreLocatorActions.getNearestEligibleStoresSuccess({
                nearByStores: normalizedStores,
                nearestEligibleStoresProps: response.nearestEligibleStoresProps,
                withinRadiusStores: response.nearestStores
              });
            }),
            catchError((error: unknown) => {
              return of(
                StoreLocatorActions.getNearestEligibleStoresFailure({
                  error: errorMessage(this.errorTag, error)
                })
              );
            })
          );
        }
      })
    );
  });

  public getFavoriteSpecialtyStore$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StoreLocatorActions.getFavoriteSpecialtyStore),
      switchMap(() => {
        return this.storeLocatorService.getFavoriteSpecialtyStore().pipe(
          map((response) => {
            return StoreLocatorActions.getFavoriteSpecialtyStoreSuccess({
              favoriteSpecialtyStore: response
            });
          }),
          catchError((error: unknown) => {
            return of(
              StoreLocatorActions.getFavoriteSpecialtyStoreFailure({
                error: errorMessage(this.errorTag, error)
              })
            );
          })
        );
      })
    );
  });
}

facade.ts

import { Injectable, inject } from '@angular/core';
import {
  NearestEligibleStoresProperties,
  NearestFulfillingStoreProperties,
  StoreDetails
} from '@digital-blocks/angular/main/store-locator/util/models';
import { Store } from '@ngrx/store';

import { StoreLocatorActions } from './store-locator.actions';
import { StoreLocatorFeature } from './store-locator.reducer';

@Injectable({ providedIn: 'root' })
export class StoreLocatorFacade {
  protected readonly store = inject(Store);

  public readonly loading$ = this.store.select(
    StoreLocatorFeature.selectLoading
  );

  public readonly error$ = this.store.select(StoreLocatorFeature.selectError);

  public readonly selectedStore$ = this.store.select(
    StoreLocatorFeature.selectSelectedStore
  );

  public readonly ineligibleReason$ = this.store.select(
    StoreLocatorFeature.selectIneligibilityReason
  );

  public readonly ineligibleReasonCode$ = this.store.select(
    StoreLocatorFeature.selectIneligibilityReasonCode
  );

  public readonly nearByStores$ = this.store.select(
    StoreLocatorFeature.selectNearByStores
  );
  public readonly withinRadiusStores$ = this.store.select(
    StoreLocatorFeature.selectWithinRadiusStores
  );

  public readonly storesByStoreId$ = this.store.select(
    StoreLocatorFeature.selectStoresByStoreId
  );

  public readonly closedStores$ = this.store.select(
    StoreLocatorFeature.selectClosedStoreNumbers
  );

  public readonly storeLocatorZipcode$ = this.store.select(
    StoreLocatorFeature.selectStoreLocatorZipcode
  );

  public readonly onConfirmRoute$ = this.store.select(
    StoreLocatorFeature.selectOnConfirmRoute
  );

  public readonly nearestFulfillingStore$ = this.store.select(
    StoreLocatorFeature.selectNearestFulfillingStore
  );
  public readonly previousPage$ = this.store.select(
    StoreLocatorFeature.selectPreviousPage
  );
  public readonly nearestFulfillingStoreProperties$ = this.store.select(
    StoreLocatorFeature.selectNearestFulfillingStoreProps
  );
  public readonly nearestEligibleStoresProps$ = this.store.select(
    StoreLocatorFeature.selectNearestEligibleStoresProps
  );
  public readonly currentStoreDetails$ = this.store.select(
    StoreLocatorFeature.selectCurrentStoreDetails
  );
  public readonly storeIdError$ = this.store.select(
    StoreLocatorFeature.selectStoreIdError
  );
  public readonly selectedStoreUpdated$ = this.store.select(
    StoreLocatorFeature.selectSelectedStoreUpdated
  );

  public readonly favoriteSpecialtyStore$ = this.store.select(
    StoreLocatorFeature.selectFavoriteSpecialtyStore
  );

  public editSelectedStore(selectedStore: string): void {
    this.store.dispatch(
      StoreLocatorActions.editSelectedStore({ selectedStore })
    );
  }

  public getStoresByZipcode(zipCode: string): void {
    this.store.dispatch(StoreLocatorActions.getStoresByZipcode({ zipCode }));
  }

  public getStoresByStoreIds(storeIds: string[]): void {
    this.store.dispatch(StoreLocatorActions.getStoresByStoreIds({ storeIds }));
  }

  public getStoresBySearchText(text: string): void {
    this.store.dispatch(StoreLocatorActions.getStoresBySearchText({ text }));
  }
  public getSpecialtyStoresBySearchText(text: string): void {
    this.store.dispatch(
      StoreLocatorActions.getSpecialtyStoresBySearchText({ text })
    );
  }

  public updateStoreLocatorZipcode(zipCode: string): void {
    this.store.dispatch(
      StoreLocatorActions.updateStoreLocatorZipcode({ zipCode })
    );
  }

  public updateOnConfirmRoute(onConfirmRoute: string): void {
    this.store.dispatch(
      StoreLocatorActions.updateOnConfirmRoute({ onConfirmRoute })
    );
  }

  public updatePreviousPage(previousPage: string): void {
    this.store.dispatch(
      StoreLocatorActions.updatePreviousPage({ previousPage })
    );
  }

  public updateCurrentStoreDetails(currentStoreDetails: StoreDetails): void {
    this.store.dispatch(
      StoreLocatorActions.updateCurrentStoreDetails({
        currentStoreDetails
      })
    );
  }

  public getNearestFulfillingStore(
    fulfillementProperties: NearestFulfillingStoreProperties,
    searchTerm?: string
  ): void {
    this.store.dispatch(
      StoreLocatorActions.getNearestFulfillingStore({
        fulfillmentProps: {
          fromStoreAddress: fulfillementProperties.fromStoreAddress,
          fromStoreId: fulfillementProperties.fromStoreId,
          prescriptionId: fulfillementProperties.prescriptionId,
          requestedQty: fulfillementProperties.requestedQty,
          ndcId: fulfillementProperties.ndcId,
          radius: fulfillementProperties.radius,
          pageNum: fulfillementProperties.pageNum,
          resultsPerPage: fulfillementProperties.resultsPerPage,
          maxItemsInResult: fulfillementProperties.maxItemsInResult,
          drugName: fulfillementProperties.drugName
        },
        searchTerm
      })
    );
  }

  public getNearestEligibleStores(
    nearestEligibleStoresProperties: NearestEligibleStoresProperties,
    searchTerm?: string
  ): void {
    this.store.dispatch(
      StoreLocatorActions.getNearestEligibleStores({
        nearestEligibleStoresProps: nearestEligibleStoresProperties,
        searchTerm
      })
    );
  }
  public getFavoriteSpecialtyStore(): void {
    this.store.dispatch(StoreLocatorActions.getFavoriteSpecialtyStore());
  }

  public resetState(): void {
    this.store.dispatch(StoreLocatorActions.resetState());
  }
}

reduce.ts

import { ReportableError } from '@digital-blocks/angular/core/util/error-handler';
import {
  NearestEligibleStoresProperties,
  FavoriteSpecialtyStore,
  NearestFulfillingStoreProperties,
  PrescriptionTransferEligibility,
  Store,
  StoreDetails
} from '@digital-blocks/angular/main/store-locator/util/models';
import { ActionReducer, createFeature, createReducer, on } from '@ngrx/store';

import { StoreLocatorActions } from './store-locator.actions';
import { noStoreFoundVerbiage } from './store-locator.constants';

export const STORE_LOCATOR_FEATURE_KEY = 'store-locator';

export interface StoreLocatorState {
  loading: boolean;
  error: ReportableError | undefined;
  selectedStore: string;
  storeLocatorZipcode: string | undefined;
  onConfirmRoute: string | undefined;
  previousPage: string;
  nearByStores: Store[]; // Eligible for transfer stores
  withinRadiusStores: Store[]; // Stores within specified radius regardless of eligibility
  storesByStoreId: Store[]; // Seperate list for rxCart
  storeIdError: boolean;
  closedStoreNumbers: string[];
  nearestFulfillingStore: PrescriptionTransferEligibility | undefined;
  nearestFulfillingStoreProps: NearestFulfillingStoreProperties | undefined;
  nearestEligibleStoresProps: NearestEligibleStoresProperties | undefined;
  currentStoreDetails: StoreDetails | undefined;
  selectedStoreUpdated: boolean;
  favoriteSpecialtyStore: undefined | FavoriteSpecialtyStore;
  ineligibilityReason: string | undefined;
  ineligibilityReasonCode: string | undefined;
}

export const initialStoreLocatorState: StoreLocatorState = {
  loading: false,
  error: undefined,
  selectedStore: '',
  closedStoreNumbers: [],
  storeLocatorZipcode: undefined,
  onConfirmRoute: undefined,
  previousPage: '',
  nearByStores: [],
  withinRadiusStores: [],
  storesByStoreId: [],
  storeIdError: false,
  nearestFulfillingStore: undefined,
  nearestFulfillingStoreProps: undefined,
  nearestEligibleStoresProps: undefined,
  currentStoreDetails: undefined,
  selectedStoreUpdated: false,
  favoriteSpecialtyStore: undefined,
  ineligibilityReason: undefined,
  ineligibilityReasonCode: undefined
};

export const reducer: ActionReducer<StoreLocatorState> = createReducer(
  initialStoreLocatorState,
  on(StoreLocatorActions.resetState, () => ({
    ...initialStoreLocatorState
  })),
  on(StoreLocatorActions.editSelectedStore, (state, { selectedStore }) => ({
    ...state,
    selectedStore,
    selectedStoreUpdated: true
  })),
  on(
    StoreLocatorActions.getStoresByZipcode,
    StoreLocatorActions.getFavoriteSpecialtyStore,
    (state) => ({
      ...state,
      loading: true
    })
  ),
  on(
    StoreLocatorActions.getStoresByZipcodeSuccess,
    (state, { nearByStores }) => ({
      ...state,
      nearByStores: removeCurrentStore(state, nearByStores),
      loading: false
    })
  ),
  on(StoreLocatorActions.getStoresByZipcodeFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(StoreLocatorActions.getStoresByStoreIds, (state) => ({
    ...state,
    storeIdError: false,
    loading: true
  })),
  on(
    StoreLocatorActions.getStoresByStoreIdsSuccess,
    (state, { nearByStores }) => ({
      ...state,
      storesByStoreId: removeCurrentStore(state, nearByStores),
      storeIdError: false,
      loading: false
    })
  ),
  on(StoreLocatorActions.getStoresByStoreIdsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    storeIdError: true,
    error
  })),
  on(StoreLocatorActions.updateStoreLocatorZipcode, (state, { zipCode }) => {
    return {
      ...state,
      storeLocatorZipcode: zipCode
    };
  }),
  on(
    StoreLocatorActions.updateCurrentStoreDetails,
    (state, { currentStoreDetails }) => {
      return {
        ...state,
        currentStoreDetails
      };
    }
  ),
  on(StoreLocatorActions.updateOnConfirmRoute, (state, { onConfirmRoute }) => {
    return {
      ...state,
      onConfirmRoute
    };
  }),
  on(StoreLocatorActions.updatePreviousPage, (state, { previousPage }) => {
    return {
      ...state,
      previousPage
    };
  }),
  on(
    StoreLocatorActions.updateNearestFulfillingStoreProps,
    (state, { nearestFulfillingStoreProps }) => {
      return {
        ...state,
        nearestFulfillingStoreProps
      };
    }
  ),

  on(StoreLocatorActions.getNearestEligibleStores, (state) => {
    return {
      ...state,
      loading: true
    };
  }),
  on(
    StoreLocatorActions.getNearestEligibleStoresSuccess,
    (
      state,
      { nearByStores, nearestEligibleStoresProps, withinRadiusStores }
    ) => {
      return {
        ...state,
        loading: false,
        nearByStores,
        nearestEligibleStoresProps,
        withinRadiusStores
      };
    }
  ),
  on(
    StoreLocatorActions.getNearestEligibleStoresFailure,
    (state, { error }) => {
      return {
        ...state,
        loading: false,
        error
      };
    }
  ),
  on(StoreLocatorActions.getStoresBySearchText, (state) => ({
    ...state,
    loading: true
  })),
  on(
    StoreLocatorActions.getStoresBySearchTextSuccess,
    (state, { nearByStores }) => ({
      ...state,
      nearByStores: removeCurrentStore(state, nearByStores),
      loading: false
    })
  ),
  on(StoreLocatorActions.getStoresBySearchTextFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(StoreLocatorActions.getSpecialtyStoresBySearchText, (state) => ({
    ...state,
    loading: true
  })),
  on(
    StoreLocatorActions.getSpecialtyStoresBySearchTextSuccess,
    (state, { nearByStores }) => ({
      ...state,
      nearByStores: removeCurrentStore(state, nearByStores),
      loading: false
    })
  ),
  on(
    StoreLocatorActions.getSpecialtyStoresBySearchTextFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),
  on(StoreLocatorActions.getNearestFulfillingStore, (state) => ({
    ...state,
    loading: true
  })),
  on(
    StoreLocatorActions.getNearestFulfillingStoreSuccess,
    (
      state,
      {
        nearByStores,
        nearestFulfillingStore,
        nearestIneligibleStore,
        withinRadiusStores
      }
    ) => ({
      ...state,
      nearestFulfillingStore:
        nearestFulfillingStore?.id === state.currentStoreDetails?.id
          ? undefined
          : nearestFulfillingStore,
      nearByStores,
      withinRadiusStores,
      loading: false,
      ineligibilityReason:
        nearestIneligibleStore?.selfServeOptions?.[0]?.reasonCodeDescription ??
        noStoreFoundVerbiage,
      ineligibilityReasonCode:
        nearestIneligibleStore?.selfServeOptions?.[0]?.reasonCode ?? ''
    })
  ),
  on(
    StoreLocatorActions.getNearestFulfillingStoreFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  ),
  on(StoreLocatorActions.setClosedStore, (state, { closedStoreNumbers }) => ({
    ...state,
    closedStoreNumbers: [...state.closedStoreNumbers, ...closedStoreNumbers]
  })),
  on(
    StoreLocatorActions.getFavoriteSpecialtyStoreSuccess,
    (state, { favoriteSpecialtyStore }) => ({
      ...state,
      favoriteSpecialtyStore,
      loading: false
    })
  ),
  on(StoreLocatorActions.getFavoriteSpecialtyStoreFailure, (state) => ({
    ...state,
    loading: false
  }))
);

export const StoreLocatorFeature = createFeature({
  name: STORE_LOCATOR_FEATURE_KEY,
  reducer
});

// We don't want to show the current store in results
const removeCurrentStore = (state: StoreLocatorState, stores: Store[]) => {
  return stores.filter(
    (store) => Number(store.id) !== Number(state.currentStoreDetails?.id)
  );
};

service.ts


import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ConfigFacade } from '@digital-blocks/angular/core/store/config';
import { Config } from '@digital-blocks/angular/core/util/config';
import { ExperienceService } from '@digital-blocks/angular/core/util/experience-service';
import {
  Cookie,
  isTestEnvironment
} from '@digital-blocks/angular/core/util/helpers';
import {
  HttpService,
  mapResponseBody
} from '@digital-blocks/angular/core/util/services';
import {
  FavoriteSpecialtyStore,
  GetFavoriteSpecialtyStoreResponse,
  PrescriptionTransferEligibilityProperties,
  PrescriptionTransferEligibilityResponse,
  StoreDetailsResponse
} from '@digital-blocks/angular/main/store-locator/util/models';
import { Observable, of, switchMap, tap } from 'rxjs';

import {
  CONFIG,
  ExtendedConfig,
  favoriteSpecialtyStoreConfig,
  storeConfig,
  transferEligibilityConfig
} from './store-locator.config';

@Injectable({
  providedIn: 'root'
})
export class StoreLocatorService {
  private readonly configFacade = inject(ConfigFacade);
  private readonly httpService = inject(HttpService);
  private readonly experienceService = inject(ExperienceService);
  searchTerm: string | undefined;

  public getStoresByZipcode(
    zipCode: string,
    radius?: number,
    pageNumber?: number,
    resultsPerPage?: number,
    maxItemsInResult?: number
  ): Observable<StoreDetailsResponse> {
    return this.experienceService
      .post<StoreDetailsResponse>(
        storeConfig.clientId,
        storeConfig.experiences,
        storeConfig.mockPath,
        {
          data: {
            storeIds: [''],
            zipCode: zipCode,
            searchText: '',
            searchFiltersInput: {
              searchRadiusInMiles: radius,
              pageNum: pageNumber ?? 0,
              resultsPerPage: resultsPerPage ?? 25,
              maxItemsInResult: maxItemsInResult ?? 25,
              serviceIndicators: ['RX_PHARMACY_IND']
            }
          }
        },
        storeConfig.overrides
      )
      .pipe(mapResponseBody());
  }

  public getStoresByStoreIds(
    storeIds: string[],
    pageNumber?: number,
    resultsPerPage?: number,
    maxItemsInResult?: number
  ): Observable<StoreDetailsResponse> {
    return storeIds.length > 0
      ? this.experienceService
          .post<StoreDetailsResponse>(
            storeConfig.clientId,
            storeConfig.experiences,
            storeConfig.mockPath,
            {
              data: {
                storeIds: storeIds,
                zipCode: '',
                searchText: '',
                searchFiltersInput: {
                  pageNum: pageNumber ?? 0,
                  resultsPerPage: resultsPerPage ?? 25,
                  maxItemsInResult: maxItemsInResult ?? 25,
                  serviceIndicators: ['RX_PHARMACY_IND']
                }
              }
            },
            storeConfig.overrides
          )
          .pipe(mapResponseBody())
      : of({
          data: {}
        } as StoreDetailsResponse);
  }

  public getRxTransferAndInventory(
    prescriptionProperties: PrescriptionTransferEligibilityProperties
  ): Observable<HttpResponse<PrescriptionTransferEligibilityResponse>> {
    return this.experienceService.post<PrescriptionTransferEligibilityResponse>(
      transferEligibilityConfig.clientId,
      transferEligibilityConfig.experiences,
      transferEligibilityConfig.mockPath,
      {
        data: {
          prescriptionTransferEligibilityInput: {
            transferRequest: [
              {
                id: prescriptionProperties.prescriptionId,
                idType: 'RXC_RX_PRESCRIPTION_ID_TYPE',
                requestedQuantity: prescriptionProperties.requestedQuantity,
                fromStore: {
                  id: prescriptionProperties.fromStoreId,
                  idType: 'RETAIL_STORE_TYPE'
                },
                transferStore: prescriptionProperties.transferStoresId.map(
                  (storeId) => {
                    return {
                      id: storeId,
                      idType: 'RETAIL_STORE_TYPE'
                    };
                  }
                ),
                drugInfo: {
                  ndcId: prescriptionProperties.ndcId
                }
              }
            ]
          }
        }
      },
      {
        maxRequestTime: 10_000
      }
    );
  }

  public getStoresBySearchText(
    text: string,
    radius?: number,
    pageNumber?: number,
    resultsPerPage?: number,
    maxItemsInResult?: number
  ): Observable<StoreDetailsResponse> {
    return this.experienceService
      .post<StoreDetailsResponse>(
        storeConfig.clientId,
        storeConfig.experiences,
        storeConfig.mockPath,
        {
          data: {
            storeIds: [''],
            zipCode: '',
            searchText: text,
            searchFiltersInput: {
              searchRadiusInMiles: radius,
              pageNum: pageNumber ?? 0,
              resultsPerPage: resultsPerPage ?? 25,
              maxItemsInResult: maxItemsInResult ?? 25,
              serviceIndicators: ['RX_PHARMACY_IND']
            }
          }
        },
        storeConfig.overrides
      )
      .pipe(mapResponseBody());
  }

  public getSpecialtyStoresBySearchText(
    text: string,
    radius?: number,
    pageNumber?: number,
    resultsPerPage?: number,
    maxItemsInResult?: number
  ): Observable<StoreDetailsResponse> {
    return this.experienceService
      .post<StoreDetailsResponse>(
        storeConfig.clientId,
        storeConfig.experiences,
        storeConfig.mockPath,
        {
          data: {
            storeIds: [''],
            zipCode: '',
            searchText: text,
            searchFiltersInput: {
              searchRadiusInMiles: radius,
              pageNum: pageNumber ?? 0,
              resultsPerPage: resultsPerPage ?? 25,
              maxItemsInResult: maxItemsInResult ?? 25,
              serviceIndicators: ['RX_SPARC_IND']
            }
          }
        },
        storeConfig.overrides
      )
      .pipe(mapResponseBody());
  }

  /**
   * Get url for respective services
   * @param {config}
   */
  public getUrl(config: Config, extendedConfig: ExtendedConfig): string {
    let url = config.baseApi?.url ?? '';

    url += CONFIG.specialty.apiRoot;

    return `${url}/${extendedConfig.serviceName}/${extendedConfig.version}/${extendedConfig.operationName}`;
  }

  /**
   * getFavoriteSpecialtyStore call - returns the first specialty store that is favorited by the user
   *
   */
  public getFavoriteSpecialtyStore(): Observable<FavoriteSpecialtyStore> {
    return this.configFacade.config$.pipe(
      switchMap((config) => {
        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            'x-api-key': config.production
              ? CONFIG.specialty.detailsKey.prod
              : CONFIG.specialty.detailsKey.sit2
          }),
          withCredentials: true
        };

        if (isTestEnvironment()) {
          httpOptions.headers = httpOptions.headers.set(
            'Authorization',
            `Bearer ${Cookie.get('access_token')}`
          );
        }

        return this.httpService
          .get<GetFavoriteSpecialtyStoreResponse>(
            this.getUrl(config, favoriteSpecialtyStoreConfig),
            favoriteSpecialtyStoreConfig.mock,
            httpOptions,
            { maxRequestTime: 10_000 }
          )
          .pipe(
            tap((response) => {
              if (response.status !== 200) {
                throw new Error(favoriteSpecialtyStoreConfig.errorMessage);
              }
            }),
            mapResponseBody(),
            switchMap((response) => {
              if (response.statusCode !== '0000' && !response.storeDetails[0]) {
                throw new Error(favoriteSpecialtyStoreConfig.errorMessage);
              }

              return of(addLeadingZero(response.storeDetails[0]));
            })
          );
      })
    );
  }
}

export const addLeadingZero = (favoriteStore: FavoriteSpecialtyStore) => {
  const storeCopy = { ...favoriteStore };

  if (
    favoriteStore.entry?.content?.properties?.PostalCode?.toString().length ===
    4
  ) {
    storeCopy.entry.content.properties.PostalCode = `0${storeCopy.entry.content.properties.PostalCode}`;
  }

  return storeCopy;
};

