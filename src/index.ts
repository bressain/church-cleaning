import fs from 'node:fs'
import path from 'node:path'
import type { Database } from 'sqlite3'
import { getDbConnection } from './db/common'
import runMigrations from './db/run-migrations'

console.info('loading...')

const dbPath = path.resolve(__dirname, '../data')
if (!fs.existsSync(dbPath)) {
	fs.mkdirSync(dbPath)
}
const dbFilePath = path.resolve(dbPath, 'db.sqlite')

let db: Database | undefined
getDbConnection(dbFilePath)
	.then(async res => {
		db = res
		await runMigrations(db)
	})
	.finally(() => {
		console.info('closing connection...')
		db?.close()
	})
