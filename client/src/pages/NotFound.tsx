import { Link } from 'react-router-dom'

export function NotFound() {
	return (
		<div>
			<h2>404</h2>
			<Link to="/">Volver</Link>
		</div>
	)
}
