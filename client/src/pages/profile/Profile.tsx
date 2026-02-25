import { useAuthStore } from '../../stores/auth'

export function Profile() {
	const token = useAuthStore((s) => s.token)
	return (
		<div>
			<h2>Profile (protected)</h2>
			<pre>{token}</pre>
		</div>
	)
}
