const array = [
  { fillDate: '2023-10-01', pres: 'Artipla' },
  { fillDate: '2023-10-04', pres: 'Met' },
  { fillDate: '2023-10-05', pres: 'Brufen' },
  { fillDate: '2023-10-06', pres: 'tab' },
];

// Define the start and end dates
const startDate = '2023-10-01';
const endDate = '2023-10-05';

// Filter the array based on the date range
const filteredArray = array.filter(item => {
  const fillDate = moment(item.fillDate);
  return fillDate.isSameOrAfter(startDate, 'day') && fillDate.isSameOrBefore(endDate, 'day');
});

console.log(filteredArray);

// UTC

function filterByDate(startDate, endDate) {
  return array.filter((item) => {
    const fillDate = moment.utc(item.fillDate); // Parse the date in UTC
    return fillDate.isBetween(startDate, endDate, null, '[]'); // '[]' includes the start and end dates
  });
}

const startDate = moment.utc('2023-10-01');
const endDate = moment.utc('2023-10-05');

const filteredArray = filterByDate(startDate, endDate);
console.log(filteredArray);


export interface IRequestResponseMap {
    indexOfRequest: number;
    errorInfo: IErrorInfo;
    lob: string;
    request: any;
    response?: any;
}
export interface IErrorInfo {
    errorMsg: string;
    details?: any;
}

export const SUCCESS_STATUS_CODES = '0000';

export function handleResponseRetail(requestResponseMap: IRequestResponseMap[], parentSpan: any): IOrdersEntity {


    const orderEntity = {} as IOrdersEntity;

    for (const requestResponseEntity of requestResponseMap) {

        if (requestResponseEntity.lob === "RETAIL") {

            if (!SUCCESS_STATUS_CODES.includes(requestResponseEntity.response.statusCode)) {
                requestResponseEntity.errorInfo = requestResponseEntity.response;
            } else {
                const uniqueRxObj: IRxNumber =  {
                    refill: ["test"]
                }
                orderEntity.lineOfBusiness = "RETAIL";
                orderEntity.patientFirstName = requestResponseEntity.response.patientFirstName;
                orderEntity.pickupDateAndTime = requestResponseEntity.request.pickupDateAndTime;
                orderEntity.storeNumber = requestResponseEntity.request.storePickupDetails.pickUpStoreId.toString();
                orderEntity.uniqueRxId = uniqueRxObj
            }
        }
    }

export interface IRxNumber {
    refill?: string[];
    renewExpired?: string[];
    renewZeroRefill?: string[];
}

export interface IOrdersEntity {
    deliveryAddress?: IAddress;
    lineOfBusiness: string;
    planId?: string;
    uniqueRxId?: IRxNumber[] | string[] | string;
    patientFirstName?: string;
    pickupDateAndTime?: string;
    storeNumber?: string;
    indexId?: string;
    orderConfirmationNumber?: string;
    purchaseId?: string;
}

export interface IAddress {
    addressLine1: string;
    addressLine2: string;
    addressTypeCode?: string;
    city: string;
    state: string;
    zipCode: string;
}

  
