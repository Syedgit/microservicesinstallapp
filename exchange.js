getError(field: string): string {
  switch (field) {
    case 'first': {
      return this.firstNameError();
    }
    case 'last': {
      return this.lastNameError();
    }
    case 'dob': {
      if (this.clickedContinue) {
        this.formErrors['dateOfBirth'] = this.isDateValid();
      } else {
        this.validateDate();
      }
      if (this.formErrors['dateOfBirth']) {
        this.taggingErrors += this.formErrors['dateOfBirth'] + '|';
      }
      return this.formErrors['dateOfBirth'];
    }
    case 'memberId': {
      const message = this.memberForm.controls['memberId'].hasError('required')
        ? Constants.MEM_ID_ERROR
        : '';
      this.formErrors['memberId'] = message;
      if (message) {
        this.taggingErrors += message + '|';
      }
      return message;
    }
    default: {
      return 'This is the default case. Choose an option.';
    }
  }
}
