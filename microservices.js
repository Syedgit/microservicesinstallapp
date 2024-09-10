<ng-container *ngIf="loading$ | async; else memberAuthTemplate">
  <ps-tile>
    <util-spinning-loader [loading]="loading$ | async"></util-spinning-loader>
  </ps-tile>
</ng-container>
<ng-template #memberAuthTemplate>
  <div class="member-container">
    <ng-container>
      <form [formGroup]="memberForm">
        <ps-helper>
          <h3>Transfer your HyVee prescriptions to an in-network pharmacy</h3>
        </ps-helper>
        <ps-input
          formControlName="firstName"
          ngDefaultControl
          name="firstName"
          input-required="true"
          label="First Name"
          is-error-announced="true"
          [error]="
          hasErrors &&
          !memberForm.controls['firstName'].valid
            ? formErrors['firstName']
              ? formErrors['firstName']
              : ''
            : undefined
        ">
        </ps-input>
        <ps-input
          formControlName="lastName"
          ngDefaultControl
          name="lastName"
          input-required="true"
          label="Last Name"
          is-error-announced="true"
          [error]="
          hasErrors &&
          !memberForm.controls['lastName'].valid
            ? formErrors['lastName']
              ? formErrors['lastName']
              : ''
            : undefined
        ">
        </ps-input>
        <ps-date-fieldset legend="Date of Birth" is-dob>
          <!-- eslint-disable-next-line -- custom inputs are needed -->
          <input slot="month" #month />
          <!-- eslint-disable-next-line -- custom inputs are needed -->
          <input slot="day" #day />
          <!-- eslint-disable-next-line -- custom inputs are needed -->
          <input slot="year" #year />
        </ps-date-fieldset>
        @if (formErrors['dateOfBirth']) {
          <ps-error>{{formErrors['dateOfBirth']}}</ps-error>
        }
        <ps-input
          formControlName="memberId"
          ngDefaultControl
          name="memberId"
          input-required="true"
          label="Member ID"
          is-error-announced="true"
          [error]="
          hasErrors &&
          !memberForm.controls['memberId'].valid
            ? formErrors['memberId']
              ? formErrors['memberId']
              : ''
            : undefined
        ">
        </ps-input>
        <div>
          <ps-button
            is-full-width="true"
            size="md"
            submit="true"
            variant="solid"
            [isFullWidth]="layoutFacade.breakpointSmall$ | async"
            (keydown)="handleKeyDown($event)"
            (click)="getMemberInfoAndToken()"
            class="continue-button">
            Continue
          </ps-button>
        </div>
      </form>
    </ng-container>
  </div>
</ng-template>


component 

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { SpinningLoaderComponent } from '@digital-blocks/angular/core/components';
import { LayoutFacade } from '@digital-blocks/angular/core/store/layout';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import {
  MemberInfo,
  MemberAuthenticationModule,
  GetMemberInfoAndTokenResponse
} from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/member-authentication';

import { MemberAuthenticationStore } from './member-authentication.store';
import { Constants } from './member-authentication.constant';

@Component({
  selector: 'lib-member-authentication',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MemberAuthenticationModule,
    SpinningLoaderComponent
  ],
  templateUrl: 'member-authentication.component.html',
  styleUrls: ['member-authentication.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [MemberAuthenticationStore],
  host: { ngSkipHydration: 'true' }
})
export class MemberAuthenticationComponent  {
  @ViewChild('month') month!: ElementRef;
  @ViewChild('day') day!: ElementRef;
  @ViewChild('year') year!: ElementRef;
  protected readonly navigationService = inject(NavigationService);
  protected readonly layoutFacade = inject(LayoutFacade);
  public readonly store = inject(MemberAuthenticationStore);
  private fb = inject(FormBuilder);
  public readonly memberTokenResponse$ = this.store.memberTokenResponse$;
  public readonly loading$ = this.store.loading$;
  public hasErrors = false;
  memberForm: FormGroup;

  public formErrors: { [key: string]: string } = {
    firstName: '',
    lastName: '',
    memberId: '',
    dateOfBirth: ''
  };

  constructor() {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      dateOfBirth: [''],
      memberId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  }

  public getMemberInfoAndToken(): void {
    const isDateValid = this.isDateValid();
    this.memberForm.markAllAsTouched();
    this.validateFormFields();
    if (this.memberForm.valid && isDateValid) {
      const patientInfo: MemberInfo = this.constructBackendReq();
      this.store.getMemberInfoAndToken(patientInfo);
      this.memberTokenResponse$.subscribe(
        (data: GetMemberInfoAndTokenResponse) => {
          if (data.statusCode === '0000' && data.access_token) {
            this.navigationService.navigate(
              '/pharmacy/-/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              {
                navigateByPath: true
              }
            );
          }
        }
      );
    } else {
      this.hasErrors = true
    }
  }

  private constructBackendReq() {
    const patientInfo: MemberInfo = {
      ...this.memberForm.value,
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };

    return patientInfo;
  }

  isDateValid() {
    const { month, day, year } = this;
    const m = parseInt(month.nativeElement.value, 10);
    const d = parseInt(day.nativeElement.value, 10);
    const y = parseInt(year.nativeElement.value, 10);
    const isValidMonth = m >= 1 && m <= 12;
    const isValidDay = d >= 1 && d <= 31; 
    const isValidYear = y >= 1900 && y <= new Date().getFullYear();

    return isValidMonth && isValidDay && isValidYear;
  }

  updateFormWithDate()  {
    const m = this.month.nativeElement.value;
    const d = this.day.nativeElement.value;
    const y = this.year.nativeElement.value;
    const dateOfBirth = `${y}-${m}-${d}`;

    this.memberForm.patchValue({
      dateOfBirth: dateOfBirth
    });
   
    return dateOfBirth
  }

  validateFormFields(): void {
    const firstNameControl = this.memberForm.get('firstName');
    const lastNameControl = this.memberForm.get('lastName');
    const memberIdControl = this.memberForm.get('memberId');

    // Check first name
    if (firstNameControl?.hasError('required') && firstNameControl.touched) {
      this.formErrors['firstName'] = Constants.F_NAME_ERROR;
    } else if (firstNameControl?.hasError('pattern') && firstNameControl.touched) {
      this.formErrors['firstName'] = Constants.F_NAME_PTRN;
    } else {
      this.formErrors['firstName'] = '';
    }

    // Check last name
    if (lastNameControl?.hasError('required') && lastNameControl.touched) {
      this.formErrors['lastName'] = Constants.L_NAME_ERROR;
    } else if (lastNameControl?.hasError('pattern') && lastNameControl.touched) {
      this.formErrors['lastName'] = Constants.L_NAME_PTRN;
    } else {
      this.formErrors['lastName'] = '';
    }

    // Check member ID
    if (memberIdControl?.hasError('required') && memberIdControl.touched) {
      this.formErrors['memberId'] = Constants.MEM_ID_ERROR;
    } else if (memberIdControl?.hasError('pattern') && memberIdControl.touched) {
      this.formErrors['memberId'] = Constants.MEM_ID_PTRN;
    } else {
      this.formErrors['memberId'] = '';
    }

    // Validate dateOfBirth (manually)
    if (!this.isDateValid()) {
      this.formErrors['dateOfBirth'] = Constants.DOB_ERROR;
    } else {
      this.formErrors['dateOfBirth'] = '';
    }
  }
  
}

