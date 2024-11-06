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
        
        <!-- Backend error -->
        <ps-alert-bar *ngIf="(error$ | async) && !hasErrors">
          <h2 slot="heading">
            {{ backendError.heading }}
          </h2>
          <p>{{ backendError.description }}</p>
        </ps-alert-bar>
        
        <!-- Form validation error -->
        <ps-alert-bar *ngIf="hasErrors && !(error$ | async)">
          <h2 slot="heading">
            {{ genericError.heading }}
          </h2>
          <p>{{ genericError.description }}</p>
        </ps-alert-bar>

        <div class="sub-header-content">
          <lib-transfer-prescriptions-sub-header
            [isCmsHeading]="true"
            [heading]="
              (store.cmsSpotContents$ | async)?.TransferRxIntroSpot ?? ''
            "></lib-transfer-prescriptions-sub-header>
        </div>
        
        <p>All fields required.</p>
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
            <input slot="month" formControlName="month" ngDefaultControl />
            <input slot="day" formControlName="day" ngDefaultControl />
            <input slot="year" formControlName="year" ngDefaultControl />
          </ps-date-fieldset>
          
          <ps-input
            label="Member ID"
            [error]="hasErrors ? getError('memberId') : undefined">
            <input
              formControlName="memberId"
              ngDefaultControl
              name="memberId"
              slo
