import pg, { QueryConfig } from 'pg'

export const withTx = async <T>(
	client: pg.Pool | pg.ClientBase,
	fn: (client: pg.ClientBase) => Promise<T>
): Promise<T> => {
	let release = false
	if (client instanceof pg.Pool) {
		client = await client.connect()
		release = true
	}

	await client.query('BEGIN')
	try {
		const result = await fn(client)
		await client.query('COMMIT')
		return result
	} catch (e) {
		await client.query('ROLLBACK')
		throw e
	} finally {
		if (release) {
			;(client as pg.PoolClient).release()
		}
	}
}

export const withClient = async <T>(
	pool: pg.Pool,
	tx: pg.ClientBase | null | undefined,
	callback: (client: pg.ClientBase) => Promise<T>
): Promise<T> => {
	const releaseClient = !tx
	const client = tx || (await pool.connect())
	try {
		return await callback(client)
	} finally {
		if (releaseClient) {
			await (client as pg.PoolClient).release()
		}
	}
}

export const sql = (
	strings: TemplateStringsArray,
	...values: unknown[]
): QueryConfig => {
	const text = strings.reduce((acc, str, i) => {
		return acc + '$' + i + str
	})
	return {
		text,
		values,
	}
}
