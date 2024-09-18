<ng-container *ngIf="loading$ | async; else memberAuthTemplate">
  <ps-tile>
    <util-spinning-loader [loading]="loading$ | async"></util-spinning-loader>
  </ps-tile>
</ng-container>

<ng-template #memberAuthTemplate>
  <div class="member-container">
    @if (hasErrors) {
      <ps-alert-bar class="alert-banner">
        <ps-label>Required Information is missing</ps-label>
        <p>Please complete all fields.</p>
      </ps-alert-bar>
    }
    <div class="sub-header-content">
      <lib-transfer-prescriptions-sub-header
        [heading]="heading"></lib-transfer-prescriptions-sub-header>
    </div>
    <ng-container>
      <form [formGroup]="memberForm">
        <ps-input
          formControlName="firstName"
          ngDefaultControl
          name="firstName"
          input-required="true"
          label="First Name"
          is-error-announced="true"
          [error]="
            hasErrors && !memberForm.controls['firstName'].valid
              ? errors.F_NAME_ERROR : memberForm.get('firstName')?.hasError('pattern') ? errors.F_NAME_PTRN
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
          hasErrors && !memberForm.controls['lastName'].valid
            ? errors.L_NAME_ERROR : memberForm.get('lastName')?.hasError('pattern') ? errors.L_NAME_PTRN
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
          <ps-error>{{ formErrors['dateOfBirth'] }}</ps-error>
        }
        <ps-input
          formControlName="memberId"
          ngDefaultControl
          name="memberId"
          input-required="true"
          label="Member ID"
          is-error-announced="true"
          [error]="
            hasErrors && !memberForm.controls['memberId'].valid
              ? errors.MEM_ID_ERROR : backendErr ? errors.MEM_ID_BACKEND_ERR
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
