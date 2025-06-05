 async processResponse(response, xhrProbe) {
        xhrProbe;
        let _root = response[Object.keys(response)[0]];
        if (_root.header.statusCode === Common_constant_1.STATUS_CODES.SUCCESS) {
            return _root;
        }
        else {
            await this.log({
                message: 'Backend api Failure',
                value: _root.header,
                interest: Common_constant_1.INTEREST.XHR
            }, common_utils_1.ErrorEnum.error, _root);
            throw _root.header;
        }
    }
}
