import type { Database } from 'sqlite3'

declare module 'vitest' {
	export interface TestContext {
		db?: Database
	}
}
