export class MemberAuthenticationComponent {

  public formErrors: { [key: string]: string } = {
    firstName: '',
    lastName: '',
    memberId: '',
    dateOfBirth: ''
  };

  constructor(private fb: FormBuilder) {
    this.memberForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      memberId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  // Simplified common validation function with custom error messages
  validateFormFields(): void {
    const firstNameControl = this.memberForm.get('firstName');
    const lastNameControl = this.memberForm.get('lastName');
    const memberIdControl = this.memberForm.get('memberId');

    // Check first name
    if (firstNameControl?.hasError('required') && firstNameControl.touched) {
      this.formErrors['firstName'] = '! Enter a first name';
    } else if (firstNameControl?.hasError('pattern') && firstNameControl.touched) {
      this.formErrors['firstName'] = '! First name must contain only letters';
    } else {
      this.formErrors['firstName'] = '';  // Clear error
    }

    // Check last name
    if (lastNameControl?.hasError('required') && lastNameControl.touched) {
      this.formErrors['lastName'] = '! Enter a last name';
    } else if (lastNameControl?.hasError('pattern') && lastNameControl.touched) {
      this.formErrors['lastName'] = '! Last name must contain only letters';
    } else {
      this.formErrors['lastName'] = '';  // Clear error
    }

    // Check member ID
    if (memberIdControl?.hasError('required') && memberIdControl.touched) {
      this.formErrors['memberId'] = '! Enter a member ID';
    } else if (memberIdControl?.hasError('pattern') && memberIdControl.touched) {
      this.formErrors['memberId'] = '! Member ID must contain only numbers';
    } else {
      this.formErrors['memberId'] = '';  // Clear error
    }

    // Validate dateOfBirth (manually)
    if (!this.isDateValid()) {
      this.formErrors['dateOfBirth'] = '! Enter a valid date as MM/DD/YYYY';
    } else {
      this.formErrors['dateOfBirth'] = '';  // Clear error if the date is valid
    }
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
}
