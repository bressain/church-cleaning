import fs from 'node:fs'
import path from 'node:path'
import { DateTime } from 'luxon'
import { Database } from 'sqlite3'
import runAllMigrations from './run-migrations'

export interface Connection {
	get: Database['get']
	all: Database['all']
	run: Database['run']
	exec: Database['exec']
	close: Database['close']
}

export function getCreateDefaultDbFilePath() {
	const dbPath = path.resolve(__dirname, '../../data')
	if (!fs.existsSync(dbPath)) {
		fs.mkdirSync(dbPath)
	}
	return path.resolve(dbPath, 'db.sqlite')
}

export async function getDbConnection(dbFilePath: string, runMigrations = false): Promise<Connection> {
	return new Promise((resolve, reject) => {
		const conn = new Database(dbFilePath, err => {
			if (err) {
				reject(err)
			}
		})
		if (runMigrations) {
			runAllMigrations(conn).then(() => {
				resolve(conn)
			})
		} else {
			resolve(conn)
		}
	})
}

// biome-ignore lint/suspicious/noExplicitAny: aligning to API
export async function fetchFirst<T>(conn: Connection, query: string, ...params: any[]): Promise<T> {
	return new Promise((resolve, reject) => {
		conn.get<T>(query, params, (error, row) => {
			if (error) {
				reject(error)
			} else {
				resolve(row)
			}
		})
	})
}

// biome-ignore lint/suspicious/noExplicitAny: aligning to API
export async function fetchAll<T>(conn: Connection, query: string, ...params: any[]): Promise<T[]> {
	return new Promise((resolve, reject) => {
		conn.all<T>(query, params, (error, rows) => {
			if (error) {
				reject(error)
			} else {
				resolve(rows)
			}
		})
	})
}

// biome-ignore lint/suspicious/noExplicitAny: aligning to API
export async function execute(conn: Connection, statement: string, ...params: any[]): Promise<void> {
	if (params.length) {
		return new Promise((resolve, reject) => {
			conn.run(statement, params, err => {
				if (err) {
					reject(err)
				}
				resolve()
			})
		})
	}
	return new Promise((resolve, reject) => {
		conn.exec(statement, err => {
			if (err) {
				reject(err)
			}
			resolve()
		})
	})
}

export function toDbString(date: Date): string {
	return DateTime.fromJSDate(date).setZone('utc').toFormat('yyyy-MM-dd hh:mm:ss.SSS')
}

export function fromDbString(date: string): Date {
	// SQLite likes to store date strings without a T separator as required by the
	// ISO 8601 standard for some asinine reason
	return DateTime.fromISO(date.replace(' ', 'T'), { zone: 'utc' }).toJSDate()
}
