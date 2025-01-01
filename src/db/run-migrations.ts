import fs from 'node:fs'
import path from 'node:path'
import { type Connection, execute, fetchFirst } from './common'

export default async function runMigrations(conn: Connection): Promise<void> {
	try {
		const latestMigration = await getLatestMigration(conn)

		const migrations = getMigrationFiles(latestMigration)
		for (const migration of migrations) {
			const sql = fs.readFileSync(path.resolve(__dirname, './migrations', migration), 'utf-8')
			await execute(conn, sql)
		}
	} catch (error) {
		console.error('Error running migrations')
		throw error
	}
}

async function getLatestMigration(conn: Connection): Promise<number> {
	try {
		const latestVersion = await fetchFirst<{ version: number }>(
			conn,
			'select version from schema_version order by version desc limit 1',
		)
		return latestVersion.version
	} catch (error) {
		if (error instanceof Error && error.message === 'SQLITE_ERROR: no such table: schema_version') {
			// no migration table yet, return 0
			return 0
		}
		throw error
	}
}

function getMigrationFiles(latestMigration: number) {
	const migrationFiles = fs
		.readdirSync(path.resolve(__dirname, './migrations'))
		.map(filename => ({ version: +filename.split('_')[0], filename }))
		.toSorted((a, b) => a.version - b.version)

	return migrationFiles.filter(mf => mf.version > latestMigration).map(mf => mf.filename)
}
