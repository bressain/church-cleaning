import { generateFamily, generateFamilyAssignment } from '../test/mothers'
import * as assignment from './assignment'
import * as family from './family'
import * as familyAssignment from './family-assignment'

describe('family-assignment', () => {
	describe('#insert', () => {
		it('inserts a family_assignment record', async ({ conn }) => {
			if (!conn) {
				expect.fail('db not initialized')
			}

			const assignments = await assignment.getAll(conn)
			const fam = generateFamily()
			await family.insert(conn, fam)
			const famAssignment = generateFamilyAssignment({
				assignmentId: assignments[0].id,
				familyId: fam.id,
			})

			await familyAssignment.insert(conn, famAssignment)
			const resFamilyAssignment = (await familyAssignment.getAll(conn)).find(fa => fa.id === famAssignment.id)

			expect(famAssignment).toEqual(resFamilyAssignment)
		})
	})
})
