import path from 'node:path'
import { afterEach, beforeEach } from 'vitest'
import { type Connection, createDbConnection } from '../src/db/common'
import '../types/index.d.ts'

const testDbFilePath = path.resolve(__dirname, 'test-db.sqlite')
let conn: Connection | undefined

beforeEach(async ctx => {
	conn = await createDbConnection(testDbFilePath)
	ctx.conn = conn
})

afterEach(() => {
	conn?.close()
})
