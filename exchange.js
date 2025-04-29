filter component.ts

import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserAnalyticsFacade } from '@digital-blocks/angular/core/store/user-analytics';
import { _cloneDeep } from '@digital-blocks/angular/core/util/helpers';
import {
  IPlPZNResponse,
  IPlanBenefitList,
  PL_PZN_RESOURCE_TAGS
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-heading';
import { PlPharmacySearchModule } from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-search';

import {
  PL_FILTER_NAME_MAPPING_FOR_TAGGING,
  PL_SELECT_FILTER_DEFAULT_VALUE,
  PL_SELECT_FILTER_STATIC_CONTENT
} from './constants/pl-select-filter.constants';
import {
  PlSearchFilterDefaultValue,
  PlSearchFilterFormGroup
} from './models/pharmacy';
import { PlSelectFilterStore } from './pl-select-filter.store';
import { AdobeTaggingConstants, pageTags } from './pl-select.filter.constants';

@Component({
  selector: 'lib-pl-select-filter',
  imports: [CommonModule, PlPharmacySearchModule, ReactiveFormsModule],
  templateUrl: './pl-select-filter.component.html',
  styleUrl: './pl-select-filter.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [PlSelectFilterStore]
})
export class PlSelectFilterComponent implements OnInit {
  @Input() public selectedSearchFiltersValue: PlSearchFilterDefaultValue =
    _cloneDeep(PL_SELECT_FILTER_DEFAULT_VALUE);
  @Input() public plPznInfo!:
    | { [key: string]: IPlPZNResponse }
    | null
    | undefined;
  @Input() public memberPlanBenefitData!: IPlanBenefitList | undefined;
  @Input() public memberPlanDetailsPrefPharmInd = 'N';
  @Output()
  public closeFilterModal = new EventEmitter<boolean>();

  public plSelectFilterStore = inject(PlSelectFilterStore);
  protected readonly userAnalyticsFacade = inject(UserAnalyticsFacade);
  private readonly destroyRef = inject(DestroyRef);

  public readonly plSelectFilterStaticText = PL_SELECT_FILTER_STATIC_CONTENT;
  public noOfFiltersSelected = 0;
  public plPznConstant = _cloneDeep(PL_PZN_RESOURCE_TAGS);
  public searchFiltersValue!: PlSearchFilterDefaultValue;

  public plSearchFilterForm: FormGroup<PlSearchFilterFormGroup> =
    new FormGroup<PlSearchFilterFormGroup>({
      checkLongterm: new FormControl(false),
      checkSpecialtyMail: new FormControl(false),
      check24HourService: new FormControl(false),
      checkDriveThruService: new FormControl(false),
      checkPreferredPharmacy: new FormControl(false),
      checkOnSiteMedicalClinic: new FormControl(false),
      checkOpen7DaysAWeek: new FormControl(false),
      checkFluShots: new FormControl(false),
      checkPrescriptionDelivery: new FormControl(false),
      checkBloodPressureScreenings: new FormControl(false),
      checkCompoundMedications: new FormControl(false),
      checkDurableMedicalEquipment: new FormControl(false),
      checkVaccineNetwork: new FormControl(false),
      selectLanguage: new FormControl(null),
      selectPharmacyType: new FormControl(null),
      selectIsland: new FormControl(null)
    });

  public ngOnInit(): void {
    this.setInitialValueForm(this.selectedSearchFiltersValue);
    this.checkNoOfOptionsSelected();
    // this.userAnalyticsFacade.loadViewEventTags(AdobeTaggingConstants.on_load);
  }

  public setInitialValueForm(plFilterValues: PlSearchFilterDefaultValue): void {
    this.plSearchFilterForm.patchValue(_cloneDeep(plFilterValues));
  }

  public checkNoOfOptionsSelected(): void {
    this.noOfFiltersSelected = Object.values(
      this.plSearchFilterForm.value
    ).filter((v) => !!v).length;
  }

  public onSubmit(): void {
    this.plSelectFilterStore.setPlPharmacySearchFilterOptions(
      <PlSearchFilterDefaultValue>this.plSearchFilterForm.value
    );
    const plSelecedFilterNames = this.plSelecedFilterNames(
      this.plSearchFilterForm.value as Record<string, boolean | string | null>
    );

    this.closeFilterModal.emit(false);

    const details: Record<string, string> = {
      adobe_page_name: pageTags.adobe_page_name,
      notification_checkbox: plSelecedFilterNames
        .toLowerCase()
        .replaceAll(' ', '_')
    };

    this.userAnalyticsFacade.linkEvent(
      'plan_and_benefits:pl:search_results_page:filters_modal:apply',
      details
    );
  }

  public cancelBtnClicked(): void {
    this.plSearchFilterForm.patchValue(
      _cloneDeep(this.selectedSearchFiltersValue)
    );
    this.checkNoOfOptionsSelected();
    this.closeFilterModal.emit(false);
    this.userAnalyticsFacade.linkEvent(
      AdobeTaggingConstants.onClick_cancel.link_name,
      AdobeTaggingConstants.onClick_cancel.details
    );
  }

  public plSelecedFilterNames(
    plFilterFormValue: Record<string, boolean | string | null>
  ): string {
    const plFilterNames = [];
    const plFilterWithTextValue = new Set([
      'selectLanguage',
      'selectPharmacyType',
      'selectIsland'
    ]);
    const plFilterNameMappingForTagging: Record<string, string> =
      PL_FILTER_NAME_MAPPING_FOR_TAGGING;

    for (const filterFormName in plFilterFormValue) {
      const filterValue = plFilterFormValue[filterFormName];

      if (!!filterValue && !plFilterWithTextValue.has(filterFormName)) {
        plFilterNames.push(plFilterNameMappingForTagging[filterFormName]);
      }
    }

    return [
      plFilterNames.join('<pipe>'),
      plFilterFormValue['selectPharmacyType'],
      plFilterFormValue['selectLanguage']
    ]
      .filter((filterValues) => !!filterValues)
      .join('|')
      .replaceAll('<pipe>', ',');
  }
}


search.Commponent.ts 

import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ConditionalModalComponent,
  SpinningLoaderComponent
} from '@digital-blocks/angular/core/components';
import { UserAnalyticsFacade } from '@digital-blocks/angular/core/store/user-analytics';
import { _cloneDeep } from '@digital-blocks/angular/core/util/helpers';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import {
  PL_SELECT_FILTER_STATIC_CONTENT,
  PlSearchFilterDefaultValue,
  PlSelectFilterComponent
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/components';
import {
  IPlExtractedMemberAddress,
  IPlMemberInfoDetails,
  IPlanBenefitList,
  IPlanDetailsList,
  IServiceAreaSuggestionData
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-heading';
import {
  PlPharmacyContentSpotModule,
  SpotRequest,
  cmsContent
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-content-spot';
import {
  PharmacyDetail,
  PlPharmacyDetailModule
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-detail';
import {
  IAddressDetailsForRequest,
  IFilterDataForRequest,
  IFormattedPharmaciesResponse,
  IPlOeFlowDetails,
  ISearchCriteriaRequest,
  IServiceAreaCoordinates,
  IStaticDetailsForRequest,
  PlPharmacySearchModule
} from '@digital-blocks/angular/pharmacy/pharmacy-locator/store/pl-pharmacy-search';
import {
  Address,
  LocationSuggestionItem
} from '@digital-blocks/angular/pharmacy/shared/services';
import {
  LocationSearchActions,
  LocationSearchFacade
} from '@digital-blocks/angular/pharmacy/shared/store/location-search';
import { SanitizeHtmlPipe } from '@digital-blocks/angular/pharmacy/shared/util/pipe';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription, combineLatestWith, filter, tap } from 'rxjs';

import { AdobeTaggingConstants } from './pl-pharmacy-search.constants';
import { PlPharmacySearchStore } from './pl-pharmacy-search.store';

@Component({
  selector: 'lib-pl-pharmacy-search',

  imports: [
    CommonModule,
    PlPharmacySearchModule,
    SpinningLoaderComponent,
    ConditionalModalComponent,
    PlSelectFilterComponent,
    PlPharmacyDetailModule,
    PlPharmacyContentSpotModule,
    SanitizeHtmlPipe
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
  @Input() public cmsContentSpots: SpotRequest[] = [];
  @Input() public googleURL!: string; // Keystone input
  @Input() public isModal = false; // Regular Input
  @Input() public externalMapHref!: string; // Regular input
  @Input() resultAnnouncementSpotName = '';
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
  private readonly actions$ = inject(Actions);

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
  public filteredServiceAreaList: IServiceAreaSuggestionData[] = [];
  public isPlOeFlow = false;
  private subscriptions = new Subscription();
  private locationChanged = false;

  private readonly locationSearchFacade = inject(LocationSearchFacade);
  public cmsResponse: cmsContent[] = [];
  public resultsAnnouncementSpot = '';
  public searchedAddressData: Address | undefined = undefined;

  public ngOnInit(): void {
    this.listenToSearchFilterOptions();
    this.listenToSearchedData();
    this.plPharmacySearchStore.loadViewEventTags(AdobeTaggingConstants.on_load);
  }

  public listenToSearchedData(): void {
    this.plPharmacySearchStore.searchedData$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: Address | undefined) => {
        this.searchedAddressData = data;
      });
  }

  public onSearchClick(): void {
    if (this.selectedAddress) {
      const pharmacySearchRequestPayload = {
        ...this.getFilterDataForRequest(),
        ...this.getAddressDetailsForRequest(),
        ...this.getStaticDetailsForRequest(),
        ...this.getOeFlowDetails()
      };

      this.callFindPharmacyExperienceApi(pharmacySearchRequestPayload);
      this.setMailPharmacyTabLabel();
      this.plPharmacySearchStore.setPlSearchedData(this.selectedAddress);
      // this.userAnalyticsFacade.loadViewEventTags(AdobeTaggingConstants.onClick_search);
    }
  }

  public getFilterDataForRequest(): IFilterDataForRequest {
    return {
      open24HoursADay: this.searchFiltersValue?.check24HourService ?? false,
      open7DaysAWeek: this.searchFiltersValue?.checkOpen7DaysAWeek ?? false,
      providesFluShots: this.searchFiltersValue?.checkFluShots ?? false,
      preparesCompounds:
        this.searchFiltersValue?.checkCompoundMedications ?? false,
      vaccineNetwork: this.searchFiltersValue?.checkVaccineNetwork ?? false,
      languageSelected: this.searchFiltersValue?.selectLanguage ?? '',
      hasDriveThruService:
        this.searchFiltersValue?.checkDriveThruService ?? false,
      prescriptionDeliveryService:
        this.searchFiltersValue?.checkPrescriptionDelivery ?? false,
      providesBloodPressureScreening:
        this.searchFiltersValue?.checkBloodPressureScreenings ?? false,
      onsiteMedicalClinic:
        this.searchFiltersValue?.checkOnSiteMedicalClinic ?? false,
      preferredPharmacy: this.searchFiltersValue?.checkPreferredPharmacy
        ? 'Y'
        : 'N',
      pharmacyType: this.getPharmacyTypeValue(
        this.searchFiltersValue?.selectPharmacyType
      ),
      durableMedicalEquipment:
        this.searchFiltersValue?.checkDurableMedicalEquipment ?? false,
      hawaiiIsland: '',
      isLongTerm: this.searchFiltersValue?.checkLongterm ?? false,
      isSpecialtyMail: this.searchFiltersValue?.checkSpecialtyMail ?? false
    };
  }



  public callFindPharmacyExperienceApi(
    pharmacySearchRequestPayload: ISearchCriteriaRequest
  ): void {
    this.plPharmacySearchStore.getPlSearchPharmacy(
      pharmacySearchRequestPayload
    );
  }





  public toggleModal(isOpen: boolean): void {
    if (this.conditionalModal) {
      if (isOpen) {
        this.conditionalModal.showModal();
        this.plPharmacySearchStore.linkEvent(
          AdobeTaggingConstants.onClick_filter
        );
      } else {
        this.conditionalModal.closeModal();
      }
    }
  }

  public listenToSearchFilterOptions(): void {
    this.plPharmacySearchStore.plPharmacySearchFilters$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((selectedFilterOptions) => {
        this.searchFiltersValue = selectedFilterOptions;
        this.checkSelectedFiltersCount();
      });
  }

 

  public clickTab($event: Event): void {
    const panelId = ($event as CustomEvent).detail.panelId;

    if (panelId == 'Retail') {
      this.plPharmacySearchStore.linkEvent(
        AdobeTaggingConstants.onClick_retail_tab
      );
    } else if (panelId == 'Mail') {
      this.plPharmacySearchStore.linkEvent(
        AdobeTaggingConstants.onClick_mail_tab.normal
      );
    } else if (panelId == 'Specialty') {
      this.plPharmacySearchStore.linkEvent(
        AdobeTaggingConstants.onClick_mail_tab.specialty
      );
    }
  }
}

