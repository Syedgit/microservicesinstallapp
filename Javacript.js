  const UrlDetail = apiSettings.getAPIUrl({}, {
            name: "retrieveFormOfPaymentv2",
        }, passedParam).then(function (res) {
            return res;
        });


const crypto = require('crypto');
const key = 'EiE0BVQle0xFjZvYOupKjXCWAcAwBaTjlZ7G7rryNos=';


function encrypt(text) {
let iv = Buffer.from(crypto.randomBytes(16), 'base64'); 
let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv);
let encrypted = cipher.update(text);
encrypted = Buffer.concat([encrypted, cipher.final()]);
var encryptedWithIVPrepended = Buffer.concat([iv, encrypted]);

const encryptedData = { 	iv						: iv.toString('base64'), 
      encryptedWithIVPrepended: encryptedWithIVPrepended.toString('base64') 
    };

  return encodeURIComponent(encryptedData.encryptedWithIVPrepended);
}
