import { create } from 'zustand'

type AuthState = {
	token: string | null
	isAuthed: boolean
	setToken: (token: string) => void
	logout: () => void
}

const KEY = 'trans_token'

export const useAuthStore = create<AuthState>((set) => {
	const stored = localStorage.getItem(KEY)

	return {
		token: stored,
		isAuthed: Boolean(stored),
		setToken: (token) => {
			localStorage.setItem(KEY, token)
			set({ token, isAuthed: true })
		},
		logout: () => {
			localStorage.removeItem(KEY)
			set({ token: null, isAuthed: false })
		},
	}
})
