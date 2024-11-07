<ng-container>
  <!-- Loading Spinner -->
  <ng-container *ngIf="loading$ | async; else memberAuthTemplate">
    <ps-tile>
      <util-spinning-loader [loading]="loading$ | async"></util-spinning-loader>
    </ps-tile>
  </ng-container>

  <!-- Main Content with Error Handling -->
  <ng-template #memberAuthTemplate>
    <ng-container>
      <div class="member-container">
        <!-- Backend Error Banner -->
        <ps-alert-bar *ngIf="(error$ | async) && !hasErrors">
          <h2 slot="heading">{{ backendError.heading }}</h2>
          <p>{{ backendError.description }}</p>
        </ps-alert-bar>

        <!-- Form Validation Error Banner -->
        <ps-alert-bar *ngIf="hasErrors && !(error$ | async)">
          <h2 slot="heading">{{ genericError.heading }}</h2>
          <p>{{ genericError.description }}</p>
        </ps-alert-bar>

        <!-- Form Content -->
        <div class="sub-header-content">
          <lib-transfer-prescriptions-sub-header
            [isCmsHeading]="true"
            [heading]="
              (store.cmsSpotContents$ | async)?.TransferRxIntroSpot ?? ''
            "
          ></lib-transfer-prescriptions-sub-header>
        </div>
        <p>All fields required.</p>

        <form [formGroup]="memberForm">
          <ps-input label="First Name" [error]="getError('first')">
            <input
              formControlName="firstName"
              slot="input"
              required
              is-error-announced="true"
            />
          </ps-input>

          <ps-input label="Last Name" [error]="getError('last')">
            <input
              formControlName="lastName"
              slot="input"
              input-required="true"
              is-error-announced="true"
            />
          </ps-input>

          <ps-date-fieldset legend="Date of Birth" is-dob [error]="getError('dob')">
            <input slot="month" formControlName="month" />
            <input slot="day" formControlName="day" />
            <input slot="year" formControlName="year" />
          </ps-date-fieldset>

          <ps-input label="Member ID" [error]="getError('memberId')">
            <input
              formControlName="memberId"
              slot="input"
              input-required="true"
              is-error-announced="true"
            />
          </ps-input>

          <!-- Continue Button -->
          <div>
            <ps-button
              is-full-width="true"
              size="md"
              submit="true"
              variant="solid"
              (click)="getMemberInfoAndToken()"
              class="continue-button"
            >
              Continue
            </ps-button>
          </div>
        </form>
      </div>
    </ng-container>
  </ng-template>
</ng-container>


componennt

public getMemberInfoAndToken(): void {
  this.validateFormFields(); // Validate fields before submitting
  this.formatDate(); // Format date for consistency

  // If form is valid and date is valid
  if (this.memberForm.valid && this.formErrors['dateOfBirth'] === '') {
    this.store.resetAllStateValues();
    const patientInfo: MemberInfo = {
      firstName: this.memberForm.get('firstName')!.value,
      lastName: this.memberForm.get('lastName')!.value,
      memberId: this.memberForm.get('memberId')!.value,
      dateOfBirth: this.memberForm.get('dateOfBirth')!.value,
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };

    // Call the store to get member info and token
    this.store.getMemberInfoAndToken(patientInfo);
    this.memberTokenResponse$
      .pipe(
        filter((data: GetMemberInfoAndTokenResponse) => !!data),
        take(1)
      )
      .subscribe(
        (data: GetMemberInfoAndTokenResponse) => {
          if (data.statusCode === '0000' && data.access_token) {
            // Success case: Navigate and reset errors
            this.backendErr = false;
            this.hasErrors = false;
            this.navigationService.navigate(
              '/pharmacy/benefits/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              { navigateByPath: true }
            );
            this.timerForSetLoader();
            this.store.saveMemberInfoRehydrate(['patientInfo']);
            this.tagLogging(
              AdobeTaggingConstants.ONCLICK_CONTINUE.link_name,
              AdobeTaggingConstants.ONCLICK_CONTINUE.details
            );
          } else {
            // Backend error handling
            this.backendErr = true;
            this.hasErrors = false;
            this.showBackendError();
          }
        },
        () => {
          // Handle error from observable
          this.backendErr = true;
          this.hasErrors = false;
          this.showBackendError();
        }
      );
  } else {
    // Form validation error
    this.hasErrors = true;
    this.backendErr = false;
  }
}

// Set generic backend error message
private showBackendError() {
  this.tagLogging(
    AdobeTaggingConstants.VALIDATION_ERROR.link_name,
    { field_errors: 'member not found: please try again' }
  );
}

timerForSetLoader() {
  timer(2000).subscribe(() => {
    this.store.setLoader();
  });
}
