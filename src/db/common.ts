import fs from 'node:fs'
import path from 'node:path'
import { Database } from 'sqlite3'

export async function getDbConnection(): Promise<Database> {
	const dbDir = path.join(__dirname, '..', '..', 'data')
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir)
	}

	return new Promise((resolve, reject) => {
		const db = new Database(path.join(dbDir, 'db.sqlite'), err => {
			if (err) {
				reject(err)
			}
		})
		resolve(db)
	})
}

// biome-ignore lint/suspicious/noExplicitAny: aligning to API
export async function fetchFirst<T>(db: Database, sql: string, ...params: any[]): Promise<T> {
	return new Promise((resolve, reject) => {
		db.get<T>(sql, params, (error, row) => {
			if (error) {
				reject(error)
			} else {
				resolve(row)
			}
		})
	})
}

// biome-ignore lint/suspicious/noExplicitAny: aligning to API
export async function fetchAll<T>(db: Database, sql: string, ...params: any[]): Promise<T[]> {
	return new Promise((resolve, reject) => {
		db.all<T>(sql, params, (error, rows) => {
			if (error) {
				reject(error)
			} else {
				resolve(rows)
			}
		})
	})
}

export async function execute(db: Database, sql: string): Promise<void> {
	return new Promise((resolve, reject) => {
		db.exec(sql, err => {
			if (err) {
				reject(err)
			}
			resolve()
		})
	})
}
