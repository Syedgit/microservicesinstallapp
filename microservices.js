it('should return an error when the transfer fails', async () => {
  const mockError = { message: 'Transfer failed' };

  jest.spyOn(experienceService, 'post').mockReturnValue(throwError(() => mockError));

  await expect(firstValueFrom(service.submitTransfer(mockRequest)))
    .rejects
    .toEqual(mockError);
});
