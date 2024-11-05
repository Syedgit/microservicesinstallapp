import { delay, filter, tap } from 'rxjs/operators';

public getMemberInfoAndToken(): void {
  this.validateFormFields();
  this.formatDate();
  
  if (this.memberForm.valid && this.formErrors['dateOfBirth'] === '') {
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

    this.memberTokenResponse$
      .pipe(
        filter((data: GetMemberInfoAndTokenResponse) => !!data && !!data.statusCode),
        tap((data: GetMemberInfoAndTokenResponse) => {
          if (data.statusCode === '0000' && data.access_token) {
            this.navigationService.navigate(
              '/pharmacy/benefits/transfer/current-prescriptions',
              { queryParamsHandling: 'preserve' },
              { navigateByPath: true }
            );
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
        }),
        delay(2000), // Adds a 2-second delay before setting the loader
        tap(() => this.store.setLoader())
      )
      .subscribe(); // Only one subscribe is used for the whole chain, minimizing nesting
  } else {
    this.hasErrors = true;
  }
}
