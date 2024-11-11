// src/store/module-auth/getters.ts
import { AuthStateInterface } from './state';

export const authGetters = {

    isAuthenticated(state: AuthStateInterface): boolean {

        return !!state.user;

    },

};
