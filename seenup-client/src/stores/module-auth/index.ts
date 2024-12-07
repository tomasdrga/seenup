// src/store/module-auth/index.ts
import { defineStore } from 'pinia';
import { authService, authManager } from 'src/services';
import { LoginCredentials, RegisterData } from 'src/contracts';
import { defaultState } from './state';
import type { AuthStateInterface } from './state';
import type { User } from 'src/contracts';
import { useChannelsStore } from '../module-channels/useChannelsStore';


export const useAuthStore = defineStore('auth', {
    state: (): AuthStateInterface => defaultState(),

    getters: {
        isAuthenticated: () => !!authManager.getToken(),
    },

    actions: {
      async check() {
        console.log('Checking user authentication');
        this.status = 'pending';
        this.errors = [];

        // Check if the network is offline
        if (!navigator.onLine) {
          await this.loadUserFromCache();
          if (this.user) {
            this.status = 'success';
            return true;
          } else {
            this.status = 'error';
            this.errors = [{ message: 'No network and no cached user data available.' }];
            return false;
          }
        }

        try {
          console.log('Calling authService.me()');
          const user = await authService.me();
          console.log('User retrieved:', user);

          if (user?.id !== this.user?.id) {
            try {
              const channelsStore = useChannelsStore();
              await channelsStore.join('general', false);
              console.log('Joined general channel');
            } catch (joinError) {
              console.error('Error joining general channel:', joinError);
            }
          }

          this.user = user;
          this.status = 'success';
          return user !== null;
        } catch (err) {
          console.error('Error in authStore.check:', err);
          this.status = 'error';
          this.errors = [{ message: (err as Error).message }];
          throw err;
        }
      },


      async loadUserFromCache() {
        try {
          const cache = await caches.open('user-data-cache');


          const cachedRequests = await cache.keys();
          cachedRequests.forEach((request) => {
            console.log('Cached request URL:', request.url);
          });

          const cachedResponse = await cache.match('http://localhost:3333/auth/me');
          if (cachedResponse) {
            const cachedUser = await cachedResponse.json();
            console.log('Cached user data:', cachedUser);

            this.user = cachedUser;
          } else {
            console.log('No cached user data found for /auth/me');
          }
        } catch (error) {
          console.error('Error loading user from cache:', error);
        }
      },

      async register(form: RegisterData): Promise<User | null> {
            this.status = 'pending';
            this.errors = [];
            try {
                const user = await authService.register(form);
                this.status = 'success';
                this.user = null;
                return user;
            } catch (err) {
                this.status = 'error';
                this.errors = [{ message: (err as Error).message }];
                throw err;
            }
        },

        async login(credentials: LoginCredentials): Promise<void | null> {
            this.status = 'pending';
            this.errors = [];
            try {
                const apiToken = await authService.login(credentials);
                this.status = 'success';
                authManager.setToken(apiToken.token);
                console.log('Token set in authManager:', apiToken.token);

            } catch (err) {
                this.status = 'error';
                this.errors = [{ message: (err as Error).message }];
                throw err;
            }
        },

        async logout() {
            this.status = 'pending';
            this.errors = [];
            try {
                await authService.logout();
                const channelsStore = useChannelsStore();
                await channelsStore.leave(null);
                this.user = null;
                authManager.removeToken();
                this.status = 'success';

            } catch (err) {
                this.status = 'error';
                this.errors = [{ message: (err as Error).message }];
                throw err;
            }
        },
    },
});
