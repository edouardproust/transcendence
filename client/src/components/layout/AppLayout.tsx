import { Link, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'

export function AppLayout() {
	const isAuthed = useAuthStore((s) => s.isAuthed)
	const logout = useAuthStore((s) => s.logout)

	return (
		<div style={{ padding: 16 }}>
			<nav style={{ display: 'flex', gap: 12 }}>
				<Link to="/">Home</Link>
				<Link to="/profile">Profile</Link>
				{!isAuthed && <Link to="/login">Login</Link>}
				{!isAuthed && <Link to="/register">Register</Link>}
				{isAuthed && <button onClick={logout}>Logout</button>}
			</nav>
			<hr style={{ margin: '16px 0' }} />
			<Outlet />
		</div>
	)
}
