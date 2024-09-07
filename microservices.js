import { Component, ElementRef, ViewChild, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from '@digital-blocks/angular/core/util/services';
import { LayoutFacade } from '@digital-blocks/angular/core/store/layout';
import { MemberAuthenticationStore } from './member-authentication.store';
import { GetMemberInfoAndTokenResponse, MemberInfo } from '@digital-blocks/angular/pharmacy/transfer-prescriptions/store/member-authentication';

@Component({
  selector: 'lib-member-authentication',
  templateUrl: 'member-authentication.component.html',
  styleUrls: ['member-authentication.component.scss']
})
export class MemberAuthenticationComponent implements OnInit {
  @ViewChild('month') month!: ElementRef;
  @ViewChild('day') day!: ElementRef;
  @ViewChild('year') year!: ElementRef;

  error: boolean;
  memberForm: FormGroup;
  public readonly memberTokenResponse$ = this.store.memberTokenResponse$;
  public readonly loading$ = this.store.loading$;

  protected readonly navigationService = inject(NavigationService);
  protected readonly layoutFacade = inject(LayoutFacade);
  private readonly store = inject(MemberAuthenticationStore);
  private fb = inject(FormBuilder);

  constructor() {
    this.memberForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      memberId: ['', Validators.required],
      dateOfBirth: ['', Validators.required]  // Placeholder for DOB validation
    });
    this.error = false;
  }

  ngOnInit(): void {}

  handleButtonClick(): void {
    const isValid = this.isDateValid();
    this.error = !isValid;

    if (isValid) {
      this.updateFormWithDate(); // Manually set the dateOfBirth in form
      this.getMemberInfoAndToken();
    }
  }

  public getMemberInfoAndToken(): void {
    if (this.memberForm.valid) {
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
    }
  }

  private constructBackendReq(): MemberInfo {
    const patientInfo: MemberInfo = {
      ...this.memberForm.value,
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };

    return patientInfo;
  }

  isDateValid(): boolean {
    const m = parseInt(this.month.nativeElement.value, 10);
    const d = parseInt(this.day.nativeElement.value, 10);
    const y = parseInt(this.year.nativeElement.value, 10);

    const hasAllFields = m && d && y;
    const date = new Date(`${m}/${d}/${y}`);
    const isValid =
      !isNaN(date as any) &&
      date.getMonth() + 1 === m &&
      date.getDate() === d &&
      date.getFullYear() === y;

    return Boolean(hasAllFields && isValid);
  }

  updateFormWithDate(): void {
    const m = this.month.nativeElement.value;
    const d = this.day.nativeElement.value;
    const y = this.year.nativeElement.value;
    
    // Construct the date in MM/DD/YYYY format
    const dateOfBirth = `${m}/${d}/${y}`;

    // Update the form control with the formatted date
    this.memberForm.patchValue({
      dateOfBirth
    });
  }
}


html

<ng-container *ngIf="loading$ | async; else memberAuthTemplate">
  <ps-tile>
    <util-spinning-loader [loading]="loading$ | async"></util-spinning-loader>
  </ps-tile>
</ng-container>

<ng-template #memberAuthTemplate>
  <div class="member-container">
    <ng-container>
      <form [formGroup]="memberForm">
        <ps-helper helper-id="helper-245">
          <h3>Transfer your HyVee prescriptions to an in-network pharmacy</h3>
        </ps-helper>

        <!-- First Name -->
        <ps-input
          formControlName="firstName"
          ngDefaultControl
          name="firstName"
          input-required="true"
          label="First Name">
        </ps-input>

        <!-- Last Name -->
        <ps-input
          formControlName="lastName"
          ngDefaultControl
          name="lastName"
          input-required="true"
          label="Last Name">
        </ps-input>

        <!-- Date of Birth Fields -->
        <ps-date-fieldset legend="Date of Birth" is-dob>
          <input slot="month" #month />
          <input slot="day" #day />
          <input slot="year" #year />
          <ul *ngIf="error" slot="error">
            <li>Please add a valid month</li>
            <li>Please add a valid day</li>
            <li>Please add a valid year</li>
          </ul>
        </ps-date-fieldset>

        <!-- Member ID -->
        <ps-input
          formControlName="memberId"
          ngDefaultControl
          name="memberId"
          input-required="true"
          label="Member ID">
        </ps-input>

        <!-- Submit Button -->
        <div>
          <ps-button
            is-full-width="true"
            size="md"
            submit="true"
            variant="solid"
            [isFullWidth]="layoutFacade.breakpointSmall$ | async"
            (keydown)="handleKeyDown($event)"
            (click)="handleButtonClick()"
            class="continue-button">
            Continue
          </ps-button>
        </div>
      </form>
    </ng-container>
  </div>
</ng-template>
