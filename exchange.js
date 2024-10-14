public mapAddressDetails(address: Address, includePhoneNumber: boolean = true): Address {
  const mappedAddress: Address = {
    line: address.line || [''],
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postalCode || '',
  };

  if (includePhoneNumber && address.phoneNumber) {
    mappedAddress.phoneNumber = address.phoneNumber;
  }

  return mappedAddress;
}


function deleteCookie(name, path) {
    document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// Delete the 'access_token' cookie from the root path
deleteCookie('access_token', '/');

// Delete the 'access_token' cookie from a subpath
deleteCookie('access_token', '/subpath');
