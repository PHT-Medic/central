const accessTokenKey = 'accessToken';

const userKey = 'user';
const userPermissionsKey = 'userPermissions';

const AuthStorage = {
  // Access Token operations

  getToken () {
    return process.server ? null : localStorage.getItem(accessTokenKey)
  },
  setToken (token) {
    if (process.server) { return }
    localStorage.setItem(accessTokenKey, token)
  },
  dropToken () {
    if (process.server) { return }
    localStorage.removeItem(accessTokenKey)
  },

  // User operations

  getUser () {
    if (process.server) { return null; }
    const user = localStorage.getItem(userKey)
    if (user !== null) {
      return JSON.parse(user)
    }

    return null
  },
  setUser (user) {
    if (process.server) { return }
    user = JSON.stringify(user)
    localStorage.setItem(userKey, user)
  },
  dropUser () {
    if (process.server) { return }
    localStorage.removeItem(userKey)
  },

  // User permissions operations

  getPermissions () {
    if (process.server) { return [] }

    const permissions = localStorage.getItem(userPermissionsKey);
    if (permissions == null) {
      return [];
    }

    return JSON.parse(permissions)
  },
  setPermissions (permissions) {
    if (process.server || !Array.isArray(permissions)) { return }
    permissions = JSON.stringify(permissions);
    localStorage.setItem(userPermissionsKey, permissions)
  },
  dropPermissions () {
    if (process.server) { return }
    localStorage.removeItem(userPermissionsKey);
  }
}

export { AuthStorage }
