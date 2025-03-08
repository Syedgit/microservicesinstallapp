import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  DestroyRef,
  Input,
  EventEmitter,
  Output,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  SpinningLoaderComponent,
  ConditionalModalComponent
} from '@digital-blocks/angular/core/components';
import { _cloneDeep } from '@digital-blocks/angular/core/util/helpers';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import {
  PlSearchFilterDefaultValue,
  PlSelectFilterComponent,
  PL_SELECT_FILTER_STATIC_CONTENT
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/components';
import {
  IPlMemberInfoDetails,
  IPlExtractedMemberAddress,
  IPlanDetailsList,
  IPlanBenefitList
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-heading';
import { SpotRequest } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-content-spot';
import { PharmacyDetail } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';
import {
  PlPharmacySearchModule,
  ISearchCriteriaRequest,
  IFormattedPharmaciesResponse,
  IFilterDataForRequest,
  IAddressDetailsForRequest,
  IStaticDetailsForRequest
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-search';
import { Address } from '@digital-blocks/angular/pharmacy/shared/services';

import { PlPharmacySearchStore } from './pl-pharmacy-search.store';

@Component({
  selector: 'lib-pl-pharmacy-search',

  imports: [
    CommonModule,
    PlPharmacySearchModule,
    SpinningLoaderComponent,
    ConditionalModalComponent,
    PlSelectFilterComponent
  ],
  templateUrl: 'pl-pharmacy-search.component.html',
  styleUrls: ['pl-pharmacy-search.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PlPharmacySearchStore],
  host: { ngSkipHydration: 'true' }
})
export class PlPharmacySearchComponent implements OnInit {
  @Input() public staticContent = {
    networkSupplyInfoTag: '',
    specialtyInfoTag: '',
    showMoreButtonText: '',
    noMorePharmacyText: '',
    retailFindPharmacyErrorHeading: '',
    retailFindPharmacyErrorDescription: '',
    mailFindPharmacyErrorHeading: '',
    mailFindPharmacyErrorDescription: '',
    searchFilterHeading: ''
  };
  @Input() public googleURL!: string; // Keystone input
  @Input() public isModal = false; // Regular Input
  @Input() public externalMapHref!: string; // Regular input
  @Input() public cmsContentSpots: SpotRequest[] | undefined;
  @Output() public createPlatFormSpecificURL = new EventEmitter<{
    baseURL: string;
    lat: string;
    long: string;
  }>();

  @ViewChild(ConditionalModalComponent)
  public conditionalModal!: ConditionalModalComponent;

  protected readonly plPharmacySearchStore = inject(PlPharmacySearchStore);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly navigationService = inject(NavigationService);

  public findPharmacyRequest = {};
  public isDefaultAddressSearch = true;
  public retailFindPharmacyFromStore: IFormattedPharmaciesResponse[] = [];
  public retailFindPharmacyDisplayed: IFormattedPharmaciesResponse[] = [];
  public retailPharmacyShowMoreCount = 0;
  public mailFindPharmacyFromStore: IFormattedPharmaciesResponse[] = [];
  public mailFindPharmacyDisplayed: IFormattedPharmaciesResponse[] = [];
  public mailPharmacyShowMoreCount = 0;
  public selectedAddress: Address | undefined = {
    formattedAddress: ''
  };
  public pharmacyDetailIndex = 0;
  public retailShowMoreButtonFormattedText = '';
  public mailShowMoreButtonFormattedText = '';
  public searchFiltersValue!: PlSearchFilterDefaultValue;
  public selectedFiltersCount = 0;
  public mailPharmacyTabLabel = 'Mail';
  public memberPlanBenefitData: IPlanBenefitList | undefined = undefined;
  public memberPlanDetailsPrefPharmInd = 'N';

  public ngOnInit(): void {
    this.listenToSearchFilterOptions();
    this.listentolocationSuggestionSelect();
    this.listenToPlMemberData();
    this.listenToRetailFindPharmacy();
    this.listenToMailFindPharmacy();
  }

  public listenToPlMemberData(): void {
    this.plPharmacySearchStore.plMemberData$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: IPlMemberInfoDetails | undefined) => {
        if (data?.memberAddress) {
          this.isDefaultAddressSearch = false;
          this.setMemberAddressAsDefaultAddress(data.memberAddress);
          this.setPlanBenefitList(data.memberPlanDetails);
          this.setMemberPlanDetailsPrefPharmInd(
            data.memberPlanDetails?.prefPharmInd
          );
        }
      });
  }

  public setMemberAddressAsDefaultAddress(
    plMemberDefaultAddress: IPlExtractedMemberAddress
  ): void {
    this.plPharmacySearchStore.setLocationDefaultAddress({
      postalCode: plMemberDefaultAddress?.postalCode,
      formattedAddress: plMemberDefaultAddress?.postalCode
    });
  }

  public listentolocationSuggestionSelect(): void {
    this.plPharmacySearchStore.selectSelectedLocation$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((address) => {
        this.selectedAddress = address;
        if (address && !this.isDefaultAddressSearch) {
          this.isDefaultAddressSearch = true;
          this.onSearchClick();
        }
      });
  }

}


store.ts

import { Injectable, inject } from '@angular/core';
import { PlSearchFilterDefaultValue } from '@digital-blocks/angular/pharmacy/pharmacy-locator/components';
import {
  PlHeadingFacade,
  IPlMemberInfoDetails,
  IPlPZNResponse
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-heading';
import {
  PlPharmacyContentSpotFacade,
  SpotRequest
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-content-spot';
import {
  PlPharmacyDetailFacade,
  PharmacyDetail
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';
import {
  PlPharmacySearchFacade,
  IFormattedPharmaciesResponse,
  ISearchCriteriaRequest
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-search';
import { Address } from '@digital-blocks/angular/pharmacy/shared/services';
import { LocationSearchFacade } from '@digital-blocks/angular/pharmacy/shared/store/location-search';
import { Observable } from 'rxjs';

@Injectable()
export class PlPharmacySearchStore {
  private readonly plHeadingFacade = inject(PlHeadingFacade);
  private readonly locationSearchFacade = inject(LocationSearchFacade);
  private readonly plPharmacySearchFacade = inject(PlPharmacySearchFacade);
  private readonly plPharmacyDetailFacade = inject(PlPharmacyDetailFacade);
  private readonly plPharmacyContentFacade = inject(
    PlPharmacyContentSpotFacade
  );

  public readonly plMemberData$: Observable<IPlMemberInfoDetails | undefined> =
    this.plHeadingFacade.plMemberData$;

  public readonly plPznData$: Observable<
    { [key: string]: IPlPZNResponse } | undefined
  > = this.plHeadingFacade.plPznData$;


  public getCmsContent(spots: SpotRequest[]) {
    this.plPharmacyContentFacade.getPlPharmacyContentSpots(spots);
  }

  public setSelectedPharmacy(pharmacy: PharmacyDetail) {
    this.plPharmacyDetailFacade.setSelectedPharmacy(pharmacy);
  }
}

