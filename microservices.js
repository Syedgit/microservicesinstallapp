it('should call updateFormWithDate, patch dateOfBirth, validate the form, and dispatch getMemberInfoAndToken action with correct payload', waitForAsync(() => {
  const patientInfo = {
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: '1990-12-25',
    flowName: 'MEMBER_ID_LOOKUP',
    source: 'CMK'
  };

  // Set form value and mock form validation
  component.memberForm.setValue({
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: '1990-12-25'
  });
  component.memberForm.markAllAsTouched();
  jest.spyOn(component.memberForm, 'valid', 'get').mockReturnValue(true);

  // Spy on store method
  const storeSpy = jest.spyOn(component.store, 'getMemberInfoAndToken');

  // Mock date validation and form patching
  const isDateValidSpy = jest.spyOn(component, 'isDateValid').mockReturnValue(true);
  const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');

  // Spy on navigation
  const navigateSpy = jest.spyOn(navigationService, 'navigate').mockReturnValue(Promise.resolve(true));

  // Mock memberTokenResponse$
  mockMemberTokenResponse$.next({
    statusCode: '0000',
    access_token: 'someToken',
    token_type: 'Bearer',
    statusDescription: 'Success'
  });

  // Subscribe to memberTokenResponse$ before calling getMemberInfoAndToken
  component.memberTokenResponse$.subscribe(
    (data) => {
      expect(data.statusCode).toBe('0000');
      expect(data.access_token).toBe('someToken');
    },
    (error) => {
      fail('Observable threw an error: ' + error);
    }
  );

  // Call the component method
  component.getMemberInfoAndToken();

  // Use whenStable to ensure all async operations complete
  fixture.whenStable().then(() => {
    // Assert that all methods were called
    expect(isDateValidSpy).toHaveBeenCalled();
    expect(updateFormWithDateSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledWith(patientInfo);

    expect(navigateSpy).toHaveBeenCalledWith(
      '/pharmacy/-/transfer/current-prescriptions',
      { queryParamsHandling: 'preserve' },
      { navigateByPath: true }
    );
    expect(navigateSpy).toHaveBeenCalledTimes(1);
  });
}));
