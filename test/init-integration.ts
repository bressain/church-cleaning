import path from 'node:path'
import { afterEach, beforeEach } from 'vitest'
import { type Connection, createDbConnection, execute } from '../src/db/common'
import '../types/index.d.ts'

const testDbFilePath = path.resolve(__dirname, 'test-db.sqlite')
let conn: Connection | undefined

beforeEach(async ctx => {
	conn = await createDbConnection(testDbFilePath)
	ctx.conn = conn
})

afterEach(async () => {
	if (conn) {
		// Note: don't truncate assignment table
		await execute(conn, 'delete from family_assignment')
		await execute(conn, 'delete from family')
	}
	conn?.close()
})
