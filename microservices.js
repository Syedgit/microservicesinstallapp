import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Renderer2, ElementRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { MemberAuthenticationComponent } from './member-authentication.component';
import { MemberAuthenticationStore } from './member-authentication.store';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MemberAuthenticationActions } from '../../../../store/member-authentication/src/lib/+state/member-authentication.actions';
import { MemberAuthenticationFacade } from '../../../../store/member-authentication/src/lib/+state/member-authentication.facade';
import {
  GetMemberInfoAndTokenRequest,
  MemberInfo
} from '../../../../store/member-authentication/src/lib/+state/member-authentication.interfaces';

describe('MemberAuthenticationComponent', () => {
  let component: MemberAuthenticationComponent;
  let fixture: ComponentFixture<MemberAuthenticationComponent>;
  let store: MockStore;
  let renderer: Renderer2;
  let facade: MemberAuthenticationFacade;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MemberAuthenticationComponent],
      providers: [
        FormBuilder,
        Renderer2,
        provideMockStore(),
        MemberAuthenticationStore,
        MemberAuthenticationFacade,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberAuthenticationComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as MockStore;
    facade = TestBed.inject(MemberAuthenticationFacade);
    renderer = TestBed.inject(Renderer2);
    jest.spyOn(store, 'dispatch');
    fixture.detectChanges();
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

  // Original test case for dispatching getMemberInfoAndToken action
  it('should dispatch getMemberInfoAndToken action with correct payload', () => {
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

  // New tests for the updated functionality
  it('should update formErrors when date is invalid', () => {
    component.month = { nativeElement: { value: '13' } } as ElementRef;
    component.day = { nativeElement: { value: '32' } } as ElementRef;
    component.year = { nativeElement: { value: '1899' } } as ElementRef;

    component.validateDateField();
    expect(component.formErrors['dateOfBirth']).toEqual('! Enter a valid date as MM/DD/YYYY');
  });

  it('should clear dateOfBirth error when date is valid', () => {
    component.month = { nativeElement: { value: '12' } } as ElementRef;
    component.day = { nativeElement: { value: '25' } } as ElementRef;
    component.year = { nativeElement: { value: '1990' } } as ElementRef;

    component.validateDateField();
    expect(component.formErrors['dateOfBirth']).toEqual('');
  });

  it('should call addDateFieldListeners and listen to inputs', () => {
    const monthEl = { nativeElement: document.createElement('input') } as ElementRef;
    const dayEl = { nativeElement: document.createElement('input') } as ElementRef;
    const yearEl = { nativeElement: document.createElement('input') } as ElementRef;

    component.month = monthEl;
    component.day = dayEl;
    component.year = yearEl;

    const spy = jest.spyOn(renderer, 'listen');

    component.addDateFieldListeners();
    expect(spy).toHaveBeenCalledWith(monthEl.nativeElement, 'input', expect.any(Function));
    expect(spy).toHaveBeenCalledWith(dayEl.nativeElement, 'input', expect.any(Function));
    expect(spy).toHaveBeenCalledWith(yearEl.nativeElement, 'input', expect.any(Function));
  });
});
