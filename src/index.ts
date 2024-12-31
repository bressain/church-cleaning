import type { Database } from 'sqlite3'
import { getDbConnection } from './db/common'
import runMigrations from './db/run-migrations'

console.info('loading...')

let db: Database | undefined
getDbConnection()
	.then(async res => {
		db = res
		await runMigrations(db)
	})
	.finally(() => {
		console.info('closing connection...')
		db?.close()
	})
