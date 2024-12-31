import path from 'node:path'
import type { Database } from 'sqlite3'
import { afterEach, beforeEach } from 'vitest'
import { getDbConnection } from '../src/db/common'
import '../types/index.d.ts'

const testDbFilePath = path.resolve(__dirname, 'test-db.sqlite')
let db: Database | undefined

beforeEach(async ctx => {
	db = await getDbConnection(testDbFilePath)
	ctx.db = db
})

afterEach(() => {
	db?.close()
})
