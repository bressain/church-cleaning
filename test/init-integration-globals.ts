import fs from 'node:fs'
import path from 'node:path'
import { type Connection, getDbConnection } from '../src/db/common'

export const testDbFilePath = path.resolve(__dirname, 'test-db.sqlite')
let conn: Connection | undefined

export async function setup() {
	console.info('Initializing test db...')
	conn = await getDbConnection(testDbFilePath, true)
	conn.close()
}

export async function teardown() {
	console.info('Deleting test db...')
	fs.rmSync(testDbFilePath)
}
