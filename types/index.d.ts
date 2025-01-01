import type { Connection } from '../src/db/common'

declare module 'vitest' {
	export interface TestContext {
		conn?: Connection
	}
}
