public getMemberInfoAndToken(): void {
  this.validateDate();
  this.validateFormFields();
  this.formatDate();

  if (this.memberForm.valid && this.formErrors['dateOfBirth'] === '') {
    this.store.resetAllStateValues();
    this.deleteCookie();

    const patientInfo: MemberInfo = {
      firstName: this.memberForm.get('firstName')!.value,
      lastName: this.memberForm.get('lastName')!.value,
      memberId: this.memberForm.get('memberId')!.value,
      dateOfBirth: this.memberForm.get('dateOfBirth')!.value,
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };

    // Make sure we wait for the response from the getMemberInfoAndToken method
    this.store.getMemberInfoAndToken(patientInfo);

    // Use switchMap to ensure we wait for getMemberInfoAndToken to complete
    this.store.memberTokenResponse$
      .pipe(
        switchMap((data: GetMemberInfoAndTokenResponse) => {
          if (data.statusCode === '0000' && data.access_token) {
            this.navigationService.navigate(
              '/pharmacy/benefits/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              {
                navigateByPath: true
              }
            );
            this.store.saveMemberInfoRehydrate(['patientInfo']);
            this.store.logMemberAuthLink(AdobeTaggingConstants.ONCLICK_CONTINUE.link_name,
              AdobeTaggingConstants.ONCLICK_CONTINUE.details);
          } else if (data.statusCode !== '0000') {
            const tagData = AdobeTaggingConstants.VALIDATION_ERROR;

            this.store.logMemberAuthLink(tagData.link_name, {
              field_errors: tagData.details.field_error,
              error_messages: '1'
            });
            this.backendErr = true;
            this.hasErrors = true;
          }
          return of(null); // Ensure a default return value for switchMap
        })
      )
      .subscribe(); // Subscribe to handle the flow
  } else {
    this.hasErrors = true;
  }
}
