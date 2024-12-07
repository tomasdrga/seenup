import { defineStore } from 'pinia'
import { User } from 'src/contracts'
import { authService, authManager } from 'src/services'
import { LoginCredentials, RegisterData } from 'src/contracts'

// State interface
export interface AuthStateInterface {
    user: User | null,
    status: 'pending' | 'success' | 'error',
    errors: { message: string, field?: string }[]
}

// Define the Pinia store
export const useAuthStore = defineStore('auth', {
    state: (): AuthStateInterface => ({
        user: null,
        status: 'pending',
        errors: []
    }),

    getters: {
        isAuthenticated: (state) => state.user !== null
    },

    actions: {
        async check() {
            this.status = 'pending'
            this.errors = []

            try {
                const user = await authService.me()
                this.status = 'success'
                this.user = user
                return user !== null
            } catch (err) {
                this.status = 'error'
                this.errors = [{ message: (err as Error).message }]
                throw err
            }
        },

        async register(form: RegisterData) {
            this.status = 'pending'
            this.errors = []

            try {
                const user = await authService.register(form)
                this.status = 'success'
                this.user = null
                return user
            } catch (err) {
                this.status = 'error'
                this.errors = [{ message: (err as Error).message }]
                throw err
            }
        },

        async login(credentials: LoginCredentials) {
            this.status = 'pending'
            this.errors = []

            try {
                const apiToken = await authService.login(credentials)
                this.status = 'success'
                this.user = null
                authManager.setToken(apiToken.token)
                return apiToken
            } catch (err) {
                this.status = 'error'
                this.errors = [{ message: (err as Error).message }]
                throw err
            }
        },

        async logout() {
            this.status = 'pending'
            this.errors = []

            try {
                await authService.logout()
                this.status = 'success'
                this.user = null
                authManager.removeToken()
            } catch (err) {
                this.status = 'error'
                this.errors = [{ message: (err as Error).message }]
                throw err
            }
        }
    }
})
