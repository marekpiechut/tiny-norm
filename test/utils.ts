import { IBackup, newDb, QueryInterceptor } from 'pg-mem'

export const handleTransaction: (
	db: ReturnType<typeof newDb>
) => QueryInterceptor = db => {
	const backups: IBackup[] = []
	return query => {
		if (query.startsWith('BEGIN')) {
			backups.push(db.backup())
		} else if (query.startsWith('COMMIT')) {
			backups.pop()
		} else if (query.startsWith('ROLLBACK')) {
			if (backups.length > 0) {
				backups.pop()?.restore()
			}
		}
		return null
	}
}
