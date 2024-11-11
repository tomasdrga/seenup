// src/store/module-auth/actions.ts
import { authService, authManager } from 'src/services';
import { LoginCredentials, RegisterData } from 'src/contracts';
import { useChannelsStore } from 'src/stores/module-channels/useChannelsStore';
import { AuthStateInterface } from './state';
import { User } from 'src/contracts';

export const authActions = {
    async check(this: AuthStateInterface): Promise<boolean> {
        console.log('Checking user authentication');
        this.status = 'pending';
        this.errors = [];
        try {
            console.log('Calling authService.me()');
            const user = await authService.me();
            console.log('User retrieved:', user);
            if (user?.id !== this.user?.id) {
                try {
                    const channelsStore = useChannelsStore();
                    await channelsStore.join('general');
                    console.log('Joined general channel');
                } catch (joinError) {
                    console.error('Error joining general channel:', joinError);
                }
            }
            this.status = 'success';
            return true;
        } catch (err) {
            this.status = 'error';
            this.errors = [{ message: (err as Error).message }];
            return false;
        }
    },

    async register(this: AuthStateInterface, form: RegisterData): Promise<User | null> {
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

    async login(this: AuthStateInterface, credentials: LoginCredentials): Promise<void | null> {
        this.status = 'pending';
        this.errors = [];
        try {
            const apiToken = await authService.login(credentials);
            this.status = 'success';
            authManager.setToken(apiToken.token);
        } catch (err) {
            this.status = 'error';
            this.errors = [{ message: (err as Error).message }];
            throw err;
        }
    },

    async logout(this: AuthStateInterface): Promise<void> {
        this.status = 'pending';
        this.errors = [];
        try {
            await authService.logout();
            this.status = 'success';
            this.user = null;
            authManager.removeToken();
        } catch (err) {
            this.status = 'error';
            this.errors = [{ message: (err as Error).message }];
            throw err;
        }
    },
};
