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
      dateOfBirth: [''], // dateOfBirth will be manually handled
      memberId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  ngOnInit(): void {
    // Add listeners to the date fields to trigger validation when they change
    this.addDateFieldListeners();
  }

  addDateFieldListeners(): void {
    this.month.nativeElement.addEventListener('input', () => this.validateDateField());
    this.day.nativeElement.addEventListener('input', () => this.validateDateField());
    this.year.nativeElement.addEventListener('input', () => this.validateDateField());
  }

  validateDateField(): void {
    const isValidDate = this.isDateValid();
    if (isValidDate) {
      this.formErrors['dateOfBirth'] = '';  // Clear error when date is valid
    } else {
      this.formErrors['dateOfBirth'] = Constants.DOB_ERROR;  // Show error when invalid
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
      this.hasErrors = true;
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

  isDateValid(): boolean {
    const { month, day, year } = this;
    const m = parseInt(month.nativeElement.value, 10);
    const d = parseInt(day.nativeElement.value, 10);
    const y = parseInt(year.nativeElement.value, 10);
    const isValidMonth = m >= 1 && m <= 12;
    const isValidDay = d >= 1 && d <= 31;
    const isValidYear = y >= 1900 && y <= new Date().getFullYear();

    return isValidMonth && isValidDay && isValidYear;
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
    this.validateDateField();  // Call this whenever validating all fields
  }
}
