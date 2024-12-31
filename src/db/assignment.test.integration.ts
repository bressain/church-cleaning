import { describe, expect, it } from 'vitest'
import { getAll } from './assignment'

describe('assignment', () => {
	describe('#getAll', () => {
		it('gets all static assignments', async ({ db }) => {
			if (!db) {
				expect.fail('db not initialized')
			}

			const assignments = await getAll(db)
			const garbagesAssignment = assignments.find(a => a.name === 'Garbages')
			expect(garbagesAssignment).not.toBeNull()
		})
	})
})
