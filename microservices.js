it('should call updateFormWithDate, patch dateOfBirth, validate the form, and dispatch getMemberInfoAndToken action with correct payload', fakeAsync(() => {
  // Prepare the patient info and expected form values
  const patientInfo  = {
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: '1990-12-25',
    flowName: 'MEMBER_ID_LOOKUP',
    source: 'CMK'
  };

  // Set the form values
  component.memberForm.setValue({
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: '1990-12-25' // Mocked date patched in
  });

  // Mock the form as valid
  component.memberForm.markAllAsTouched();
  jest.spyOn(component.memberForm, 'valid', 'get').mockReturnValue(true);

  // Spies for required functions
  const isDateValidSpy = jest.spyOn(component, 'isDateValid').mockReturnValue(true);
  const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');
  const storeSpy = jest.spyOn(component.store, 'getMemberInfoAndToken');
  const navigateSpy = jest.spyOn(navigationService, 'navigate').mockReturnValue(Promise.resolve(true));

  // Trigger the method
  component.getMemberInfoAndToken();

  // Expectations
  expect(isDateValidSpy).toHaveBeenCalled();
  expect(updateFormWithDateSpy).toHaveBeenCalled();
  expect(storeSpy).toHaveBeenCalledWith(patientInfo);

  // Simulate the memberTokenResponse$ emission
  mockMemberTokenResponse$.next({
    statusCode: '0000',
    access_token: 'someToken',
    token_type: 'Bearer',
    statusDescription: 'Success'
  });

  tick(); // Simulate async calls

  // Verify navigation is called with expected parameters
  expect(navigateSpy).toHaveBeenCalledWith(
    '/pharmacy/-/transfer/current-prescriptions',
    { queryParamsHandling: 'preserve' },
    { navigateByPath: true }
  );

  expect(navigateSpy).toHaveBeenCalledTimes(1);
}));
