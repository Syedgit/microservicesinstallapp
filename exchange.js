
url: 'https://internal-pt.pt1.digital-pbm-rx-pt.cvshealth.com/microservices/rxpbm-find-pharmacy/pharmacy/search/v1/save-primary'


     name: param.url.name,
                request: {
                    headers: encryptedHeaders,
                    url: response.config.url ? response.config.url.substr(0, 70) + _crypto.encryptWithCipher(response.config.url.substr(70), "sdkKey") : 'N/A',
                    timeout: response.config.timeout,
                    method: response.config.method


  encryptWithCipher(buffer, cipherKey) {
        const cipher = crypto.createCipheriv('aes-128-cbc', cipherKey);
        let encryptText = cipher.update(buffer, 'utf8', 'hex');
        encryptText += cipher.final('hex');
        return encryptText;
    }
