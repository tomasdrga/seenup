// src/store/module-auth/state.ts
import { User } from 'src/contracts';

export interface AuthStateInterface {
    user: User | null;
    status: 'pending' | 'success' | 'error';
    errors: { message: string; field?: string }[];
}

export function defaultState(): AuthStateInterface {
    return {
        user: null,
        status: 'pending',
        errors: [],
    };
}
