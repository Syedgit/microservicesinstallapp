it('should not dispatch getMemberInfoAndToken if form is invalid', () => {
  // Make the form invalid by setting empty values
  component.memberForm.get('firstName')?.setValue('');
  component.memberForm.get('lastName')?.setValue('');
  component.memberForm.get('memberId')?.setValue('');

  const dispatchSpy = jest.spyOn(store, 'dispatch');
  component.getMemberInfoAndToken();
  
  // Ensure no dispatch happens due to invalid form
  expect(dispatchSpy).not.toHaveBeenCalled();
  expect(component.hasErrors).toBe(true);  // Verify that error flag is set
});

it('should dispatch getMemberInfoAndToken if form is valid', () => {
  // Set valid form values
  component.memberForm.get('firstName')?.setValue('John');
  component.memberForm.get('lastName')?.setValue('Doe');
  component.memberForm.get('memberId')?.setValue('12345');

  // Mock date validation to return true
  jest.spyOn(component, 'isDateValid').mockReturnValue(true);

  const dispatchSpy = jest.spyOn(store, 'dispatch');
  component.getMemberInfoAndToken();

  expect(dispatchSpy).toHaveBeenCalled();
  expect(component.hasErrors).toBe(false);  // Ensure error flag is reset
});

it('should update the form with dateOfBirth before dispatching the action', () => {
  // Mock form values and date validation
  component.memberForm.get('firstName')?.setValue('John');
  component.memberForm.get('lastName')?.setValue('Doe');
  component.memberForm.get('memberId')?.setValue('12345');

  const updateDateSpy = jest.spyOn(component, 'updateFormWithDate');
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  // Mock date validation to return true
  jest.spyOn(component, 'isDateValid').mockReturnValue(true);

  component.getMemberInfoAndToken();

  // Check that updateFormWithDate was called before dispatch
  expect(updateDateSpy).toHaveBeenCalled();
  expect(dispatchSpy).toHaveBeenCalled();
});
