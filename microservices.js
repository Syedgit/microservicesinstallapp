import { ComponentFixture, TestBed , fakeAsync, tick} from '@angular/core/testing';
import { Renderer2, ElementRef} from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MemberAuthenticationComponent } from './member-authentication.component';
import { MemberAuthenticationStore } from './member-authentication.store';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
/* eslint-disable no-secrets/no-secrets -- not a secret */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MemberAuthenticationActions } from '../../../../store/member-authentication/src/lib/+state/member-authentication.actions';
import { MemberAuthenticationFacade } from '../../../../store/member-authentication/src/lib/+state/member-authentication.facade';
import { GetMemberInfoAndTokenRequest, GetMemberInfoAndTokenResponse, MemberInfo } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/member-authentication';
import { EffectsModule } from '@ngrx/effects';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import { BehaviorSubject } from 'rxjs';



describe('MemberAuthenticationComponent', () => {
  let component: MemberAuthenticationComponent;
  let fixture: ComponentFixture<MemberAuthenticationComponent>;
  let store: any;
  let rendererMock: Renderer2;
  let facade: MemberAuthenticationFacade;
  let storeSpy : jest.SpyInstance;
  let navigationService: NavigationService;
  let mockMemberTokenResponse$: BehaviorSubject<GetMemberInfoAndTokenResponse>
  beforeEach(async () => {

    mockMemberTokenResponse$ = new BehaviorSubject<GetMemberInfoAndTokenResponse>({
      statusCode: '0000',
      access_token: 'someToken',
       token_type: "Bearer",
       statusDescription: "Success"
    });
    const mockStore = {
      getMemberInfoToken: jest.fn(),
      mockMemberTokenResponse$: mockMemberTokenResponse$
    }
    rendererMock = {
     listen: jest.fn((el, ev, callback) => {
      if (typeof callback === 'function') {
        callback();
      }
      return () => {};
     })
    } as unknown as Renderer2;
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        StoreModule.forRoot(),
        EffectsModule.forRoot([]),
        HttpClientTestingModule],
      providers: [
        FormBuilder,
        Renderer2,
        provideMockStore(),
        {provide: MemberAuthenticationStore, useValue: {mockMemberTokenResponse$: mockMemberTokenResponse$.asObservable(), getMemberInfoAndToken: jest.fn()}},
        MemberAuthenticationFacade
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MemberAuthenticationComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as MockStore;
    facade = TestBed.inject(MemberAuthenticationFacade);
    storeSpy = jest.spyOn(store, 'dispatch');
    fixture.detectChanges();
    navigationService = TestBed.inject(NavigationService);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form controls', () => {
    expect(component.memberForm.contains('firstName')).toBeTruthy();
    expect(component.memberForm.contains('lastName')).toBeTruthy();
    expect(component.memberForm.contains('memberId')).toBeTruthy();
    expect(component.memberForm.contains('dateOfBirth')).toBeTruthy();
  });

  it('should validate firstName as required', () => {
    const firstNameControl = component.memberForm.get('firstName');
    firstNameControl?.setValue('');
    expect(firstNameControl?.valid).toBeFalsy();
    expect(firstNameControl?.errors?.['required']).toBeTruthy();
  });

  it('should validate lastName as required', () => {
    const lastNameControl = component.memberForm.get('lastName');
    lastNameControl?.setValue('');
    expect(lastNameControl?.valid).toBeFalsy();
    expect(lastNameControl?.errors?.['required']).toBeTruthy();
  });

  it('should validate memberId as required', () => {
    const memberIdControl = component.memberForm.get('memberId');
    memberIdControl?.setValue('');
    expect(memberIdControl?.valid).toBeFalsy();
    expect(memberIdControl?.errors?.['required']).toBeTruthy();
  });

  it('should dispatch getMemberInfoAndToken action with correct payload', () => {
    // const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');
    const patientInfo: MemberInfo = {
      memberId: '12345',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };
    const expectedRequest: GetMemberInfoAndTokenRequest = {
      data: {
        idType: 'PBM_QL_ENC_PARTICIPANT_ID_TYPE',
        lookupReq: patientInfo
      }
    };

    facade.getMemberInfoAndToken(expectedRequest, true);

    expect(store.dispatch).toHaveBeenCalledWith(
      MemberAuthenticationActions.getMemberInfoAndToken({
        request: expectedRequest,
        useTransferSecret: true
      })
    );
  });

  it('should call updateFormWithDate, patch dateOfBirth, validate the form, and dispatch getMemberInfoAndToken action with correct payload', fakeAsync(() => {
    const patientInfo  = {
      firstName: 'John',
      lastName: 'Doe',
      memberId: '12345',
      dateOfBirth: '1990-12-25',
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };
    // const patchValueSpy = jest.spyOn(component.memberForm, 'patchValue');
    component.memberForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      memberId: '12345',
      dateOfBirth: '1990-12-25'
    });
    component.memberForm.markAllAsTouched();
    jest.spyOn(component.memberForm, 'valid' , 'get').mockReturnValue(true);
    const storeSpy = jest.spyOn(component.store, 'getMemberInfoAndToken');
    const isDateValidSpy = jest.spyOn(component, 'isDateValid').mockReturnValue(true);
    const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');
    const navigateSpy = jest.spyOn(navigationService, 'navigate').mockReturnValue(Promise.resolve(true));
    
    
    // jest.spyOn(component.store, 'memberTokenResponse$', 'get').mockReturnValue(mockMemberTokenResponse$);
    component.getMemberInfoAndToken();
    expect(isDateValidSpy).toHaveBeenCalled();
    expect(updateFormWithDateSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledWith(patientInfo);
    component.memberTokenResponse$.subscribe((data) =>{
      expect(data.statusCode).toBe('0000');
      expect(data.access_token).toBe('someToken');
    })
    mockMemberTokenResponse$.next({
      statusCode: '0000',
      access_token: 'someToken',
      token_type: "Bearer",
      statusDescription: "Success"
    });
    tick();
    expect(navigateSpy).toHaveBeenCalledWith(
      '/pharmacy/-/transfer/current-prescriptions',
      { queryParamsHandling: 'preserve' },
      { navigateByPath: true }
    );

    // expect(patchValueSpy).toHaveBeenCalledWith({dateOfBirth: '1990-12-25'});
    // expect(component.memberForm.value.dateOfBirth).toEqual({ dateOfBirth: '1990-12-25' });
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  }));

  it('should update formErrors when date is invalid', () => {
    component.month = { nativeElement: { value: '13' } } as ElementRef;
    component.day = { nativeElement: { value: '32' } } as ElementRef;
    component.year = { nativeElement: { value: '1899' } } as ElementRef;

    component.validateDateField();
    expect(component.formErrors['dateOfBirth']).toEqual('Enter a valid date as MM/DD/YYYY');
  });

  it('should clear dateOfBirth error when date is valid', () => {
    component.month = { nativeElement: { value: '12' } } as ElementRef;
    component.day = { nativeElement: { value: '25' } } as ElementRef;
    component.year = { nativeElement: { value: '1990' } } as ElementRef;

    component.validateDateField();
    expect(component.formErrors['dateOfBirth']).toEqual('');
  });
  it('should validate form fields and set formErrors correctly when fields are invalid', () => {
    component.memberForm.get('firstName')?.setValue('');
    component.memberForm.get('firstName')?.markAllAsTouched();
    component.memberForm.get('lastName')?.setValue('');
    component.memberForm.get('lastName')?.markAllAsTouched();
    component.memberForm.get('memberId')?.setValue('');
    component.memberForm.get('memberId')?.markAllAsTouched();
   
    component.month = { nativeElement: { value: '13' } } as ElementRef;
    component.day = { nativeElement: { value: '32' } } as ElementRef;
    component.year = { nativeElement: { value: '1899' } } as ElementRef;

    component.validateFormFields();

    expect(component.formErrors['firstName']).toEqual('Enter a first name');
    expect(component.formErrors['lastName']).toEqual('Enter a last name');
    expect(component.formErrors['memberId']).toEqual('Enter a member ID');
    expect(component.formErrors['dateOfBirth']).toEqual('Enter a valid date as MM/DD/YYYY');
  });
  it('should validate form fields and set formErrors correctly when pattern does not match', () => {
    component.memberForm.get('firstName')?.setValue('123');
    component.memberForm.get('firstName')?.markAllAsTouched();
    component.memberForm.get('lastName')?.setValue('456');
    component.memberForm.get('lastName')?.markAllAsTouched();
   
    component.validateFormFields();

    expect(component.formErrors['firstName']).toEqual('First name must contain only letters');
    expect(component.formErrors['lastName']).toEqual('Last name must contain only letters');
  });

  it('should return formatted date for backend YYYY-MM-DD', () => {   
    component.month = { nativeElement: { value: '02' } } as ElementRef;
    component.day = { nativeElement: { value: '25' } } as ElementRef;
    component.year = { nativeElement: { value: '1956' } } as ElementRef;

    component.updateFormWithDate();

    expect(component.memberForm.get('dateOfBirth')?.value).toEqual('1956-02-25');
  });

  it('should prevent default for enter and key', () => {   
    const enterE = new KeyboardEvent ('keydown', { key: 'Enter'});
    const spaceE = new KeyboardEvent ('keydown', { key: ' '});
    const preventDefSpy = jest.spyOn(enterE, 'preventDefault');
    component.handleKeyDown(enterE);
    expect(preventDefSpy).toHaveBeenCalled();
    component.handleKeyDown(spaceE);
    expect(preventDefSpy).toHaveBeenCalled();
  });
  // it('should call addDateFieldListeners and listen to inputs', () => {
  //   const monthEl = { nativeElement: document.createElement('input') } as ElementRef;
  //   const dayEl = { nativeElement: document.createElement('input') } as ElementRef;
  //   const yearEl = { nativeElement: document.createElement('input') } as ElementRef;

  //   component.month = monthEl;
  //   component.day = dayEl;
  //   component.year = yearEl;

  //   const mockCallback = jest.fn();

  //   rendererMock.listen = jest.fn().mockImplementation((el, event,callback) => {
  //     if (el=== monthEl.nativeElement && event === 'input') {
  //       callback();
  //       mockCallback();
  //     }
  //     return () => {}
  //   })
  //   component.addDateFieldListeners();
  //   monthEl.nativeElement.value = '12';
  //   const event = new Event('input');
  //   monthEl.nativeElement.dispatchEvent(event);

  //   expect(mockCallback).toHaveBeenCalledWith();
  // });
});
