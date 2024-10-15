deleteCookie(): void {
    const cookieName = "access_token"
    if (typeof document === 'undefined') {
      return undefined;
    }
    let cookie = document?.cookie
      .split('; ')
      .map((cookie) => {
        const [name, value, path] = cookie.split('=');

        return {
          name,
          value,
          path
        };
      })
      // cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
