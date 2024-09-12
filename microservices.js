  public getMemberInfoAndToken(): void {
    const isDateValid = this.isDateValid();

    this.memberForm.markAllAsTouched();
    this.validateFormFields();
    this.updateFormWithDate();
    if (this.memberForm.valid && isDateValid) {
      const patientInfo: MemberInfo = {
        ...this.memberForm.value,
        flowName: 'MEMBER_ID_LOOKUP',
        source: 'CMK'
      };
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
