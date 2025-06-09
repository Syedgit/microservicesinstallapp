public after(
    _args: SetPrimaryPharmacyParamI90,
    data: { [key: string]: any },
    header: Interface.Response.AfterHeader
): Promise<Interface.Response.AfterResponse<any>> {
    const response: { [key: string]: any } = {};

    if (data?.setprimarypharmacymultiplani90Response) {
        response.setprimarypharmacymultiplanResponse = data.setprimarypharmacymultiplani90Response;
    } else {
        response.setprimarypharmacymultiplanResponse = data;
    }

    return Promise.resolve({
        get: () => response
    });
}
