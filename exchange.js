<!-- eslint-disable @angular-eslint/template/no-call-expression -->
<ng-container>
  <ng-container *ngIf="loading$ | async; else memberAuthTemplate">
    <ps-tile>
      <util-spinning-loader [loading]="loading$ | async"></util-spinning-loader>
    </ps-tile>
  </ng-container>

  <ng-template #memberAuthTemplate>
    <ng-container>
      <div class="member-container">
        @if (!hasErrors && error$) {
          <ps-alert-bar>
            <h2 slot="heading">
              {{ backendError.heading }}
            </h2>
            <p>{{ backendError.description }}</p>
          </ps-alert-bar>
        } 
        @if (!error$ && hasErrors) {
          <ps-alert-bar>
            <h2 slot="heading">
              {{ genericError.heading }}
            </h2>
            <p>{{ genericError.description }}</p>
          </ps-alert-bar>
        }
        <div class="sub-header-content">
          <lib-transfer-prescriptions-sub-header
            [isCmsHeading]="true"
            [heading]="
              (store.cmsSpotContents$ | async)?.TransferRxIntroSpot ?? ''
            "></lib-transfer-prescriptions-sub-header>
        </div>
        <p>All fields required.</p>
        <ng-container>
          <form [formGroup]="memberForm">
            <ps-input
              label="First Name"
              [error]="
                getError('first') == '' ? undefined : formErrors['firstName']
              ">
              <input
                formControlName="firstName"
                ngDefaultControl
                slot="input"
                required
                is-error-announced="true" />
            </ps-input>
            <ps-input
              label="Last Name"
              [error]="
                getError('last') == '' ? undefined : formErrors['lastName']
              ">
              <input
                formControlName="lastName"
                ngDefaultControl
                input-required="true"
                slot="input"
                is-error-announced="true" />
            </ps-input>
            <ps-date-fieldset
              legend="Date of Birth"
              is-dob
              [error]="getError('dob')">
              <!-- eslint-disable-next-line -- custom inputs are needed -->
              <input slot="month" formControlName="month" ngDefaultControl />
              <!-- eslint-disable-next-line -- custom inputs are needed -->
              <input slot="day" formControlName="day" ngDefaultControl />
              <!-- eslint-disable-next-line -- custom inputs are needed -->
              <input slot="year" formControlName="year" ngDefaultControl />
            </ps-date-fieldset>
            <ps-input
              label="Member ID"
              [error]="hasErrors ? getError('memberId') : undefined">
              <input
                formControlName="memberId"
                ngDefaultControl
                name="memberId"
                slot="input"
                input-required="true"
                is-error-announced="true" />
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
    </ng-container>
  </ng-template>
</ng-container>
