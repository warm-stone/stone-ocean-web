// utils/auth.js
const TOKEN_KEY = 'auth_token' // 自定义键名

export function storeToken(token:string) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export function hasToken() {
    return !!localStorage.getItem(TOKEN_KEY)
}

