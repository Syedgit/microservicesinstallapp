public mapAddressDetails(
  address: Address,
  isPharmacy = false
): Address {
  const mappedAddress: Address = {
    line: address.line || [''],
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postalCode || ''
  };

  // If it's a pharmacy, use the phone number from the address
  if (isPharmacy && address.phoneNumber) {
    mappedAddress.phoneNumber = address.phoneNumber.replaceAll('-', '');
  }

  // If it's not a pharmacy (i.e., it's a member), use the cardHolderPhoneNum
  if (!isPharmacy && this.cardHolderPhoneNum) {
    mappedAddress.phoneNumber = this.cardHolderPhoneNum.replaceAll('-', '');
  }

  return mappedAddress;
}
