import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import { LayoutFacade } from '@digital-blocks/angular/core/store/layout';
import { MemberInfo, GetMemberInfoAndTokenResponse } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/member-authentication';
import { MemberAuthenticationStore } from './member-authentication.store';

@Component({
  selector: 'lib-member-authentication',
  standalone: true,
  templateUrl: 'member-authentication.component.html',
  styleUrls: ['member-authentication.component.scss'],
  providers: [MemberAuthenticationStore]
})
export class MemberAuthenticationComponent implements OnInit {
  @ViewChild('month') month!: ElementRef;
  @ViewChild('day') day!: ElementRef;
  @ViewChild('year') year!: ElementRef;

  protected readonly navigationService = inject(NavigationService);
  protected readonly layoutFacade = inject(LayoutFacade);
  public readonly store = inject(MemberAuthenticationStore);
  private fb = inject(FormBuilder);

  public readonly memberTokenResponse$ = this.store.memberTokenResponse$;
  public readonly loading$ = this.store.loading$;

  memberForm: FormGroup;
  error: boolean = false;  // Flag to track date validation error

  constructor() {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],  // Only letters
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],   // Only letters
      dateOfBirth: ['', Validators.required],  // Placeholder for date, updated manually
      memberId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]  // Only numbers
    });
  }

  ngOnInit(): void {}

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
    }
  }

  public getMemberInfoAndToken(): void {
    const isValidDate = this.isDateValid();

    // Mark all form fields as touched to trigger validation messages
    this.memberForm.markAllAsTouched();

    // Set error flag if date is invalid
    this.error = !isValidDate;

    // Only proceed if form is valid and date is valid
    if (this.memberForm.valid && isValidDate) {
      this.updateFormWithDate();
      const patientInfo: MemberInfo = this.constructBackendReq();
      this.store.getMemberInfoAndToken(patientInfo);
    }
  }

  private constructBackendReq(): MemberInfo {
    return {
      ...this.memberForm.value,
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };
  }

  // Validate the date fields (month, day, year)
  isDateValid(): boolean {
    const m = parseInt(this.month.nativeElement.value, 10);
    const d = parseInt(this.day.nativeElement.value, 10);
    const y = parseInt(this.year.nativeElement.value, 10);

    const isValidMonth = m >= 1 && m <= 12;
    const isValidDay = d >= 1 && d <= 31; // Improve this for month length handling
    const isValidYear = y >= 1900 && y <= new Date().getFullYear();

    return isValidMonth && isValidDay && isValidYear;
  }

  // Update the form with the valid date (YYYY-MM-DD)
  updateFormWithDate(): void {
    const m = this.month.nativeElement.value;
    const d = this.day.nativeElement.value;
    const y = this.year.nativeElement.value;

    const dateOfBirth = `${y}-${m}-${d}`;

    // Update the dateOfBirth form control
    this.memberForm.patchValue({
      dateOfBirth: dateOfBirth
    });
  }
}


html


<form [formGroup]="memberForm">

  <!-- First Name -->
  <ps-input formControlName="firstName" ngDefaultControl name="firstName" input-required="true" label="First Name"></ps-input>
  <div *ngIf="memberForm.get('firstName')?.invalid && memberForm.get('firstName')?.touched">
    <p class="error">! Enter a first name</p>
  </div>
  <div *ngIf="memberForm.get('firstName')?.errors?.pattern && memberForm.get('firstName')?.touched">
    <p class="error">! First name must contain only letters</p>
  </div>

  <!-- Last Name -->
  <ps-input formControlName="lastName" ngDefaultControl name="lastName" input-required="true" label="Last Name"></ps-input>
  <div *ngIf="memberForm.get('lastName')?.invalid && memberForm.get('lastName')?.touched">
    <p class="error">! Enter a last name</p>
  </div>
  <div *ngIf="memberForm.get('lastName')?.errors?.pattern && memberForm.get('lastName')?.touched">
    <p class="error">! Last name must contain only letters</p>
  </div>

  <!-- Date of Birth Fields -->
  <ps-date-fieldset legend="Date of Birth" is-dob>
    <input slot="month" #month />
    <input slot="day" #day />
    <input slot="year" #year />
    <ul *ngIf="error" slot="error">
      <li class="error">! Enter date as MM/DD/YYYY</li>
    </ul>
  </ps-date-fieldset>

  <!-- Member ID -->
  <ps-input formControlName="memberId" ngDefaultControl name="memberId" input-required="true" label="Member ID"></ps-input>
  <div *ngIf="memberForm.get('memberId')?.invalid && memberForm.get('memberId')?.touched">
    <p class="error">! Enter a memberId</p>
  </div>
  <div *ngIf="memberForm.get('memberId')?.errors?.pattern && memberForm.get('memberId')?.touched">
    <p class="error">! Member ID must contain only numbers</p>
  </div>

  <!-- Submit Button -->
  <div>
    <ps-button is-full-width="true" size="md" submit="true" variant="solid" (click)="getMemberInfoAndToken()" class="continue-button">Continue</ps-button>
  </div>
</form>
