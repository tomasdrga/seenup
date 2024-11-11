import { boot } from 'quasar/wrappers';
import { authManager } from 'src/services';
import { RouteLocationNormalized, RouteLocationRaw } from 'vue-router';
import { useAuthStore } from '../stores/module-auth';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
  }
}

const loginRoute = (from: RouteLocationNormalized): RouteLocationRaw => {
  return {
    name: 'login',
    query: { redirect: from.fullPath },
  };
};

// This boot file wires together authentication handling with router
export default boot(({ router }) => {
  const authStore = useAuthStore(); // Initialize the auth store

  // if the token was removed from storage, redirect to login
  authManager.onLogout(() => {
    router.push(loginRoute(router.currentRoute.value));
  });

  // add route guard to check auth user
  router.beforeEach(async (to) => {
    const isAuthenticated = authStore.isAuthenticated; // Use the Pinia auth store

    // route requires authentication
    if (to.meta.requiresAuth && !isAuthenticated) {
      // if not logged in, redirect to login page
      return loginRoute(to);
    }

    // route is only for guests, so redirect to home if authenticated
    if (to.meta.guestOnly && isAuthenticated) {
      return { name: 'home' };
    }
  });
});
