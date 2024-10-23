const storeId = /cvs|hy[-\s]?vee/i.test(pharmacyName)
  ? pharmacy.storeId || ''
  : '99999';
