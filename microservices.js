constructor() {
  this.memberForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: this.fb.group({
      month: ['', Validators.required],
      day: ['', Validators.required],
      year: ['', Validators.required]
    }),
    memberId: ['', Validators.required]
  });
}


<ps-input
  formControlName="firstName"
  ngDefaultControl
  name="firstName"
  input-required="true"
  label="First Name">
</ps-input>

<ps-input
  formControlName="lastName"
  ngDefaultControl
  name="lastName"
  input-required="true"
  label="Last Name">
</ps-input>

<!-- Date of Birth -->
<fieldset>
  <legend>Date of Birth</legend>
  <input
    formControlName="month"
    placeholder="MM"
    type="text"
  />
  <input
    formControlName="day"
    placeholder="DD"
    type="text"
  />
  <input
    formControlName="year"
    placeholder="YYYY"
    type="text"
  />
</fieldset>

<ps-input
  formControlName="memberId"
  ngDefaultControl
  name="memberId"
  input-required="true"
  label="Member ID">
</ps-input>
