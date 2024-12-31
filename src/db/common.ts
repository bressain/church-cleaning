import { Database } from 'sqlite3'

export async function getDbConnection(dbFilePath: string): Promise<Database> {
	return new Promise((resolve, reject) => {
		const db = new Database(dbFilePath, err => {
			if (err) {
				reject(err)
			}
		})
		resolve(db)
	})
}

// biome-ignore lint/suspicious/noExplicitAny: aligning to API
export async function fetchFirst<T>(db: Database, query: string, ...params: any[]): Promise<T> {
	return new Promise((resolve, reject) => {
		db.get<T>(query, params, (error, row) => {
			if (error) {
				reject(error)
			} else {
				resolve(row)
			}
		})
	})
}

// biome-ignore lint/suspicious/noExplicitAny: aligning to API
export async function fetchAll<T>(db: Database, query: string, ...params: any[]): Promise<T[]> {
	return new Promise((resolve, reject) => {
		db.all<T>(query, params, (error, rows) => {
			if (error) {
				reject(error)
			} else {
				resolve(rows)
			}
		})
	})
}

// biome-ignore lint/suspicious/noExplicitAny: aligning to API
export async function execute(db: Database, statement: string, ...params: any[]): Promise<void> {
	return new Promise((resolve, reject) => {
		db.run(statement, params, err => {
			if (err) {
				reject(err)
			}
			resolve()
		})
	})
}
