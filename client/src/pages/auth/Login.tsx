import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'

export function Login() {
	const setToken = useAuthStore((s) => s.setToken)
	const nav = useNavigate()
	const loc = useLocation() as any

	function onLogin() {
		setToken('dev-token')
		nav(loc?.state?.from ?? '/profile', { replace: true })
	}

	return (
		<div>
			<h2>Login</h2>
			<button onClick={onLogin}>Login (dev)</button>
		</div>
	)
}
