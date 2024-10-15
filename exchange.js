deleteCookie(): void {
  const cookieName = "access_token";

  if (typeof document === 'undefined') {
    return;
  }

  // Function to delete a cookie with a specific path
  const deleteCookieAtPath = (path: string): void => {
    document.cookie = `${cookieName}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  };

  // List of possible paths where the cookies might exist
  const possiblePaths = ['/', '/some-path']; // Add other paths as needed

  // Loop through the possible paths and delete the cookie at each path
  for (const path of possiblePaths) {
    deleteCookieAtPath(path);
  }
}
