public getMemberInfoAndToken(): void {
    this.validateFormFields();
    this.formatDate();
    if (this.memberForm.valid && this.formErrors['dateOfBirth'] == '') {
      this.store.resetAllStateValues();
      const patientInfo: MemberInfo = {
        firstName: this.memberForm.get('firstName')!.value,
        lastName: this.memberForm.get('lastName')!.value,
        memberId: this.memberForm.get('memberId')!.value,
        dateOfBirth: this.memberForm.get('dateOfBirth')!.value,
        flowName: 'MEMBER_ID_LOOKUP',
        source: 'CMK'
      };

      this.store.getMemberInfoAndToken(patientInfo);
      this.memberTokenResponse$.subscribe(
        (data: GetMemberInfoAndTokenResponse) => {
          if (data.statusCode === '0000' && data.access_token) {
            this.navigationService.navigate(
              '/pharmacy/benefits/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              {
                navigateByPath: true
              }
            );
            timer(2000).subscribe(() => {
              this.store.setLoader();
            })
            this.store.saveMemberInfoRehydrate(['patientInfo']);
            this.tagLogging(
              AdobeTaggingConstants.ONCLICK_CONTINUE.link_name,
              AdobeTaggingConstants.ONCLICK_CONTINUE.details
            );
          } else if (data.statusCode !== '0000') {
            const tagData = AdobeTaggingConstants.VALIDATION_ERROR;

            this.tagLogging(tagData.link_name, {
              field_errors: 'member not found:please try again'
            });
            this.backendErr = true;
            this.hasErrors = true;
          }
        }
      );
    } else {
      this.hasErrors = true;
    }
  }
