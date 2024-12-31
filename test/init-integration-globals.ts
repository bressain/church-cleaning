import fs from 'node:fs'
import path from 'node:path'
import type { Database } from 'sqlite3'
import { getDbConnection } from '../src/db/common'
import runMigrations from '../src/db/run-migrations'

export const testDbFilePath = path.resolve(__dirname, 'test-db.sqlite')
let db: Database | undefined

export async function setup() {
	console.info('Initializing test db...')
	db = await getDbConnection(testDbFilePath)
	await runMigrations(db)
	db.close()
}

export async function teardown() {
	console.info('Deleting test db...')
	fs.rmSync(testDbFilePath)
}
