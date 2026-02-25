import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

export function RequireAuth() {
	const isAuthed = useAuthStore((s) => s.isAuthed)
	const loc = useLocation()

	if (!isAuthed)
		return <Navigate to="/login" replace state={{ from: loc.pathname }} />

	return <Outlet />
}
