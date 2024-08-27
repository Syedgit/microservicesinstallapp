service

if (searchTerm?.length >= 3) {
      this.store.autoSugguestSearch(searchTerm);
      this.store.resourceSet$.pipe().subscribe({
        next: (resp: ResourceSet[]) => {
          const locationList: Value[] = resp?.[0]?.resources?.[0]?.value;
          if (locationList?.length === 0) {
            this.locationSuggestions = [];
          } else {
            this.locationSuggestions = [];
            this.constructLocationSuggestionsList([...(locationList || [])]);
          }
        }
      });

interface

export interface AutoSuggestResponse {
  authenticationResultCode?: string;
  brandLogoUri?: string;
  copyright?: string;
  resourceSets: ResourceSet[];
  statusCode: number;
  statusDescription: string;
  traceId?: string;
}
 
export interface ResourceSet {
  estimatedTotal: number;
  resources: Resource[];
}
 
interface Resource {
  __type?: string;
  value?: Value[];
}
 
export interface Value {
  __type: string;
  address?: Address;
}
 
export interface Address {
  countryRegion?: string;
  locality?: string;
  adminDistrict?: string;
  adminDistrict2?: string;
  countryRegionIso2?: string;
  postalCode?: string;
  formattedAddress: string;
  houseNumber?: string;
  addressLine?: string;
  streetName?: string;
}
