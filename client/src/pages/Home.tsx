import { useEffect, useState } from 'react'
import { http } from '../lib/http'

export function Home() {
	const [msg, setMsg] = useState('cargando...')

	useEffect(() => {
		http.get('/users', { responseType: 'text' })
			.then((r) => setMsg(String(r.data)))
			.catch((e) => setMsg(`ERROR API: ${e?.message ?? 'unknown'}`))
	}, [])

	return (
		<div>
			<h2>Frontend OK</h2>
			<div>Prueba backend (GET /api/users):</div>
			<pre>{msg}</pre>
		</div>
	)
}
