it('should call updateFormWithDate, patch dateOfBirth, validate the form, and dispatch getMemberInfoAndToken action with correct payload', fakeAsync(() => {
  const patientInfo  = {
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: '1990-12-25',
    flowName: 'MEMBER_ID_LOOKUP',
    source: 'CMK'
  };

  // Set form values
  component.memberForm.setValue({
    firstName: 'John',
    lastName: 'Doe',
    memberId: '12345',
    dateOfBirth: ''  // Let updateFormWithDate set this later
  });

  // Mock isDateValid and updateFormWithDate
  const isDateValidSpy = jest.spyOn(component, 'isDateValid').mockReturnValue(true);
  const updateFormWithDateSpy = jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');
  
  // Mock the form being valid
  jest.spyOn(component.memberForm, 'valid', 'get').mockReturnValue(true);

  // Mock the store method
  const storeSpy = jest.spyOn(component.store, 'getMemberInfoAndToken');
  
  // Mock navigation service
  const navigateSpy = jest.spyOn(navigationService, 'navigate').mockReturnValue(Promise.resolve(true));
  
  // Trigger the function
  component.getMemberInfoAndToken();
  
  // Ensure methods are called
  expect(isDateValidSpy).toHaveBeenCalled();
  expect(updateFormWithDateSpy).toHaveBeenCalled();
  
  // Ensure the store method is called with the correct payload
  expect(storeSpy).toHaveBeenCalledWith(patientInfo);
  
  // Emit a value from memberTokenResponse$
  mockMemberTokenResponse$.next({
    statusCode: '0000',
    access_token: 'someToken',
    token_type: 'Bearer',
    statusDescription: 'Success'
  });
  
  // Simulate async time passage
  tick();
  
  // Check navigation call
  expect(navigateSpy).toHaveBeenCalledWith(
    '/pharmacy/-/transfer/current-prescriptions',
    { queryParamsHandling: 'preserve' },
    { navigateByPath: true }
  );
}));
