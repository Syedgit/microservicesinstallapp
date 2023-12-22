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


  Crypto:

  
const CCrypto = require("crypto-js");
// import sha256 from 'crypto-js/sha256';
// import hmacSHA512 from 'crypto-js/hmac-sha512';
// import Base64 from 'crypto-js/enc-base64';

function paymenIdEncryption(args) {
    const convertToString = `${args.paymentId} + "_" + ${args.specialtyID}`.toString();
    const secret_key = "EiE0BVQle0xFjZvYOupKjXCWAcAwBaTjlZ7G7rryNos=";
    const encryptedData = CCrypto.AES.encrypt(convertToString, secret_key, {
        keySize: 256 / 8,
    }).toString();
    const encodedEncText = CCrypto.enc.Base64.stringify(CCrypto.enc.Utf8.parse(encryptedData));

  const UrlencodedEncText = encodeURIComponent(encodedEncText)

  return UrlencodedEncText;
}

Compare:

Sit3: GwJPNUfPXZZsuc0iqOFhn%2BYhMJKxXBUGl9g3iKqL8CE%3D

Local: VTJGc2RHVmtYMTkxWXlna2IrcTdxeFhZZ29maEpjQWRsK3hkY05jZU41VUQ4L2NLbzJKNWI2TVNkQ0lOOGFDMg%3D%3D

// function paymenIdEncryptionWithPath(args) {
//     const convertToString = `${args.paymentId} + "_" + ${args.specialtyID}`.toString();
//     const secret_key = "EiE0BVQle0xFjZvYOupKjXCWAcAwBaTjlZ7G7rryNos=";

//   const message, nonce, path, privateKey; // ...
//   const hashDigest = sha256(nonce + message);
//   const hmacDigest = Base64.stringify(hmacSHA512(path + hashDigest, privateKey));

//   return hmacDigest;
// }

const args = {specialtyID: '8089205', paymentId: 1384220};

console.log("Encryption1st", paymenIdEncryption(args));


  DBPL logic:

  <func:function name="xsutil:encryptSha256">
			<xsl:param name="parameter"/>
			<func:result select="dp:encode(dp:encrypt-string('http://www.w3.org/2001/04/xmlenc#aes256-cbc',$genericKey,$parameter),'url')"/>
		</func:function>
		<func:function name="xsutil:decryptSha256">
			<xsl:param name="parameter"/>
			<func:result select="dp:decrypt-data('http://www.w3.org/2001/04/xmlenc#aes256-cbc',$genericKey,dp:decode($parameter,'url'))"/>
		</func:function>


	Result : 

	const CCrypto = require('crypto-js');
const CEncUtf8 = CCrypto.enc.Utf8;
const CEncBase64 = CCrypto.enc.Base64;

function encryptSha256(convertToString, secretKey) {
    // Encrypt the convertToString using AES-256 with CBC mode
    const encryptedData = CCrypto.AES.encrypt(convertToString, secretKey, {
        keySize: 256 / 8,
        mode: CCrypto.mode.CBC,
        padding: CCrypto.pad.Pkcs7,
        iv: CCrypto.lib.WordArray.random(128 / 8),
    });

    // Encode the encrypted result to Base64
    const base64Result = encryptedData.toString(CEncBase64);

    // URL encode the Base64-encoded result
    const urlEncodedResult = encodeURIComponent(base64Result);

    return urlEncodedResult;
}

// Example usage
const secretKey = "EiE0BVQle0xFjZvYOupKjXCWAcAwBaTjlZ7G7rryNos=";
const convertToString = "your_convertToString_here"; // Replace with your actual value
const result = encryptSha256(convertToString, secretKey);
console.log('Encrypted and URL Encoded Result:', result);


