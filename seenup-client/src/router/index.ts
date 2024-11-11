// src/router/index.ts
import { route } from 'quasar/wrappers';
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { useAuthStore } from '../stores/module-auth';
import routes from './routes';

// Define the router configuration
export default route(function (/* { store, ssrContext } */) {
  // Determine the history mode based on the environment
  const createHistory = process.env.SERVER ? createMemoryHistory : createWebHistory;

  // Create the router instance
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(), // History mode for cleaner URLs
  });

  // Add navigation guards
  Router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    authStore.check(); // Check if the user is authenticated

    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      // If the route requires authentication and the user is not authenticated, redirect to login
      console.log('Navigation guard: requires auth, redirecting to login');
      next({ name: 'login' });
    } else if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
      // If the route is for guests only and the user is authenticated, redirect to home
      console.log('Navigation guard: guest only, redirecting to home');
      next({ name: 'home' });
    } else {
      // Otherwise, proceed to the route
      next();
    }
  });

  // Return the router instance
  return Router;
});