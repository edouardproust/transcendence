import { useNavigate } from 'react-router-dom'

export function Register() {
	const nav = useNavigate()
	return (
		<div>
			<h2>Register</h2>
			<button onClick={() => nav('/login')}>Ir a Login</button>
		</div>
	)
}
