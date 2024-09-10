export class MemberAuthenticationComponent {

  public formErrors: { [key: string]: string } = {
    firstName: '',
    lastName: '',
    memberId: '',
    dateOfBirth: ''  // Add dateOfBirth error handling
  };

  constructor(private fb: FormBuilder) {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      memberId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  // Common validation function with dateOfBirth validation added
  validateFormFields(): void {
    Object.keys(this.formErrors).forEach(field => {
      if (field !== 'dateOfBirth') {  // Skip dateOfBirth for now
        const control = this.memberForm.get(field);

        if (control && control.touched) {
          if (control.hasError('required')) {
            this.formErrors[field] = `! ${this.capitalize(field)} is required`;
          } else if (control.hasError('pattern')) {
            this.formErrors[field] = this.getPatternErrorMessage(field);
          } else {
            this.formErrors[field] = '';  // Clear the error if no issues
          }
        }
      }
    });

    // Validate dateOfBirth (manually)
    if (!this.isDateValid()) {
      this.formErrors['dateOfBirth'] = '! Enter a valid date as MM/DD/YYYY';
    } else {
      this.formErrors['dateOfBirth'] = '';  // Clear the error if the date is valid
    }
  }

  // Helper to capitalize the first letter of the field name
  capitalize(field: string): string {
    return field.charAt(0).toUpperCase() + field.slice(1);
  }

  // Helper to return pattern-specific error messages
  getPatternErrorMessage(field: string): string {
    if (field === 'firstName' || field === 'lastName') {
      return `! ${this.capitalize(field)} must contain only letters`;
    } else if (field === 'memberId') {
      return `! ${this.capitalize(field)} must contain only numbers`;
    }
    return '';
  }

  // Form submission handler
  public getMemberInfoAndToken(): void {
    this.memberForm.markAllAsTouched();
    this.validateFormFields();

    if (this.memberForm.valid && this.isDateValid()) {
      const patientInfo = this.constructBackendReq();
      this.store.getMemberInfoAndToken(patientInfo);
    }
  }

  // Date validation function
  isDateValid(): boolean {
    const m = parseInt(this.month.nativeElement.value, 10);
    const d = parseInt(this.day.nativeElement.value, 10);
    const y = parseInt(this.year.nativeElement.value, 10);

    const isValidMonth = m >= 1 && m <= 12;
    const isValidDay = d >= 1 && d <= 31;
    const isValidYear = y >= 1900 && y <= new Date().getFullYear();

    return isValidMonth && isValidDay && isValidYear;
  }

  // Other methods (e.g., constructBackendReq()) remain unchanged
}


html

<form [formGroup]="memberForm">

  <!-- First Name Error -->
  <p *ngIf="formErrors.firstName" class="error">{{ formErrors.firstName }}</p>

  <!-- Last Name Error -->
  <p *ngIf="formErrors.lastName" class="error">{{ formErrors.lastName }}</p>

  <!-- Date of Birth Error -->
  <p *ngIf="formErrors.dateOfBirth" class="error">{{ formErrors.dateOfBirth }}</p>

  <!-- Member ID Error -->
  <p *ngIf="formErrors.memberId" class="error">{{ formErrors.memberId }}</p>

  <!-- Continue Button -->
  <div>
    <ps-button is-full-width="true" size="md" submit="true" variant="solid" (click)="getMemberInfoAndToken()" class="continue-button">
      Continue
    </ps-button>
  </div>
</form>
