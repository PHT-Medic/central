import { AuthStorage } from './../services/authStorage';

export default function ({ store, route, redirect }) {
  if (route.meta.some(m => m.requiresAuth) || route.matched.some(record => record.meta.requiresAuth)) {
    let user;

    // jwt accessToken not set, redirect to login route.
    if (AuthStorage.getToken() == null) {
      redirect({
        path: '/login',
        query: { redirect: route.fullPath }
      });
    } else if (route.matched.some(record => record.meta.requiresAdminRights)) {
      if ((user = AuthStorage.getUser()) !== null) {
        if (user.isAdmin === 1) {
          return;
        }
      }

      redirect({ path: '/login' });
    }
  } else if (route.meta.some(m => m.requiresGuestState) || route.matched.some(record => record.meta.requiresGuestState)) {
    if (AuthStorage.getToken()) {
      redirect({ path: '/' });
    }
  }
};
