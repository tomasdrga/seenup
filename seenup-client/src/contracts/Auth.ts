export interface ApiToken {
    type: 'bearer'
    token: string
    expires_at?: string
    expires_in?: number
}

export interface RegisterData {
    email: string
    nickname: string
    first_name: string
    last_name: string
    password: string
    passwordConfirmation: string
    profile_picture?: string
}

export interface LoginCredentials {
    email: string
    password: string
    remember: boolean
}

export interface User {
    id: number
    email: string
    nickname: string
    first_name: string
    last_name: string
    status: 'active' | 'offline' | 'dnd'
    profile_picture: string | null
    createdAt: string
    updatedAt: string
}
