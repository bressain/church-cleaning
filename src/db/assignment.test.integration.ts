import { getAll } from './assignment'

describe('assignment', () => {
	describe('#getAll', () => {
		it('gets all static assignments', async ({ conn }) => {
			if (!conn) {
				expect.fail('db not initialized')
			}

			const assignments = await getAll(conn)
			const garbagesAssignment = assignments.find(a => a.name === 'Garbages')
			expect(garbagesAssignment).not.toBeNull()
		})
	})
})
