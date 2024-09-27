import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CurrentPrescriptionsService,
  getPrescriptionsForTransferResponse
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/current-prescriptions';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

import { CurrentPrescriptionsComponent } from './current-prescriptions.component';
import { CurrentPrescriptionsStore } from './current-prescriptions.store';

describe('CurrentPrescriptionsComponent', () => {
  let component: CurrentPrescriptionsComponent;
  let fixture: ComponentFixture<CurrentPrescriptionsComponent>;
  let service: CurrentPrescriptionsService;
  let store: CurrentPrescriptionsStore;

  const initialState = {
    config: {
      loading: false,
      currentPrescriptions: []
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot(),
        EffectsModule.forRoot()
      ],
      providers: [
        CurrentPrescriptionsStore,
        CurrentPrescriptionsService,
        provideMockStore({ initialState })
      ]
    }).compileComponents();

    service = TestBed.inject(CurrentPrescriptionsService);
    store = TestBed.inject(CurrentPrescriptionsStore);
    fixture = TestBed.createComponent(CurrentPrescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize select prescription form', () => {
    const mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );

    component.initializeSelectPrescriptionForm(mockApiResponse);
    expect(component.formatedPrescriptionResponse).toEqual(mockApiResponse);
    expect(component.selectPrescriptionForm).toBeTruthy();
  });

  it('should set value for respective form value on user selection', () => {
    const mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );
    const event = {
      target: {
        checked: true
      }
    } as unknown as Event;
    const personCode = mockApiResponse[0].personCode;
    const prescriptionName: string =
      mockApiResponse[0].prescriptionforPatient[0].id;

    component.initializeSelectPrescriptionForm(mockApiResponse);
    component.onCheckboxSelect(event, personCode, prescriptionName);
    expect(
      component.selectPrescriptionForm
        ?.get(`user_${personCode}`)
        ?.get(prescriptionName)?.value
    ).toEqual(true);
  });

  it('verify is all prescriptions checked', () => {
    const mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );
    const selectedPrescription = mockApiResponse[0].prescriptionforPatient;

    component.initializeSelectPrescriptionForm(mockApiResponse);
    const isAllPrescriptionSelected =
      component.isAllPrescriptionSelected(selectedPrescription);

    expect(isAllPrescriptionSelected).toEqual(false);
  });

  it('verify is all prescriptions checked with undefined', () => {
    const isAllPrescriptionSelected =
      component.isAllPrescriptionSelected(undefined);

    expect(isAllPrescriptionSelected).toEqual(false);
  });

  it('verify is all prescriptions if isselected flag is not available', () => {
    const nonIsSelectFlag = [] as unknown as any;
    const isAllPrescriptionSelected =
      component.isAllPrescriptionSelected(nonIsSelectFlag);

    expect(isAllPrescriptionSelected).toEqual(false);
  });

  it('should select or unselect all prescription on select all selection', () => {
    const spy = jest.spyOn(store, 'updatePrescriptionSelection');
    const mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );
    const event = {
      target: {
        checked: true
      }
    } as unknown as Event;
    const personCode = mockApiResponse[0].personCode;

    component.initializeSelectPrescriptionForm(mockApiResponse);
    component.onChangeSelectAll(event, personCode);
    store.updatePrescriptionSelection(mockApiResponse);
    expect(spy).toHaveBeenCalledWith(mockApiResponse);
  });

  it('should call on change select all with undefined prescriptions ', () => {
    const spy = jest.spyOn(component, 'onChangeSelectAll');
    const mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );
    const event = {
      target: {
        checked: true
      }
    } as unknown as Event;
    const personCode = mockApiResponse[0].personCode;

    component.initializeSelectPrescriptionForm(mockApiResponse);
    component.onChangeSelectAll(event, personCode);
    expect(spy).toHaveBeenCalled();
  });
  it('should call on change select all with empty member object', () => {
    const spy = jest.spyOn(component, 'onChangeSelectAll');
    const mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );
    const event = {
      target: {
        checked: true
      }
    } as unknown as Event;
    const personCode = mockApiResponse[0].personCode;

    component.initializeSelectPrescriptionForm(mockApiResponse);
    component.onChangeSelectAll(event, personCode);
    expect(spy).toHaveBeenCalled();
  });

  it('should call initialize Select Prescription Form with null value', () => {
    const spy = jest.spyOn(component, 'initializeSelectPrescriptionForm');

    component.initializeSelectPrescriptionForm([null] as any);
    expect(spy).toHaveBeenCalled();
  });

  it('should call initialize Select Prescription Form with prescriptions null value', () => {
    const spy = jest.spyOn(component, 'initializeSelectPrescriptionForm');
    let mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );

    mockApiResponse = mockApiResponse.map((memberDetails) => ({
      ...memberDetails,
      prescriptionforPatient: null as any
    }));
    component.initializeSelectPrescriptionForm(mockApiResponse);
    expect(spy).toHaveBeenCalled();
  });

  it('should call initialize Select Prescription Form with prescriptions [null] value', () => {
    const spy = jest.spyOn(component, 'initializeSelectPrescriptionForm');
    let mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );

    mockApiResponse = mockApiResponse.map((memberDetails) => ({
      ...memberDetails,
      prescriptionforPatient: [null] as any
    }));
    component.initializeSelectPrescriptionForm(mockApiResponse);
    expect(spy).toHaveBeenCalled();
  });

  it('should verify noPrescriptionSelected as false', () => {
    const mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );

    component.formatedPrescriptionResponse = mockApiResponse;
    component.selectPrescriptionForm = component.formBuilder.group({
      user_001: component.formBuilder.group({
        selectAll_001: true
      })
    });

    component.onSubmit();
    expect(component.noPrescriptionSelected).toEqual(false);
  });
  it('should verify noPrescriptionSelected as true', () => {
    component.selectPrescriptionForm = component.formBuilder.group({
      user_001: component.formBuilder.group({
        selectAll_001: false
      })
    });

    component.onSubmit();
    expect(component.noPrescriptionSelected).toEqual(true);
  });

  it('should listen to current prescriptions state parameter', () => {
    const spy = jest.spyOn(component, 'initCurrentPrescriptions');

    component.listenToCurrentPrescriptions();
    store.currentPrescriptions$.subscribe(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should set current prescription rehydrate as empty array', () => {
    const spy1 = jest.spyOn(component, 'listenToCurrentPrescriptions');

    component.ngOnInit();

    expect(spy1).toHaveBeenCalled();
  });

  it('should listen to init prescriptions with data', () => {
    const spy1 = jest.spyOn(component, 'initializeSelectPrescriptionForm');
    const mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );

    component.initCurrentPrescriptions(mockApiResponse);

    expect(spy1).toHaveBeenCalled();
  });

  it('should listen to init prescriptions with no data', () => {
    const spy1 = jest.spyOn(component, 'initializeSelectPrescriptionForm');

    component.initCurrentPrescriptions([]);

    expect(spy1).not.toHaveBeenCalled();
  });

  it('should make already transferred flag to true', () => {
    let mockApiResponse =
      service.constructMemberDetailsFromGetPrescriptionResponse(
        getPrescriptionsForTransferResponse.data.getLinkedMemberPatients
      );

    mockApiResponse = mockApiResponse.map((data) => {
      data.prescriptionforPatient = [];

      return data;
    });

    component.initCurrentPrescriptions(mockApiResponse);

    expect(component.prescriptionsAlreadyTransferred).toEqual(true);
  });
});
