import { DateTime } from 'luxon'
import * as assignment from '../db/assignment'
import * as family from '../db/family'
import * as familyAssignment from '../db/family-assignment'
import { generateAssignment, generateFamily, generateFamilyAssignment, generateFamilyPerson } from '../test/mothers'
import { createMockConnection } from '../test/util'
import { shuffle } from '../util'
import createAssignments from './create-assignments'

vi.mock('../db/common')
vi.mock('../db/assignment')
vi.mock('../db/family')
vi.mock('../db/family-assignment')
vi.mock('../util')

describe('create-assignments', () => {
	const conn = createMockConnection()
	const date = DateTime.local(2025, 1, 1).toJSDate()
	const assignments = [generateAssignment({ name: 'Chapel' }), generateAssignment({ name: 'Gym' })]
	const families = Array.from({ length: 20 }).map((_, idx) =>
		generateFamily({
			surname: `fam-${idx}`,
			p1: generateFamilyPerson({ name: `fam-${idx}-1` }),
		}),
	)

	beforeEach(() => {
		vi.resetAllMocks()
		vi.mocked(assignment.getAll).mockResolvedValue(assignments)
		vi.mocked(family.getAllAvailable).mockResolvedValue(families)
	})

	it('generates family assignments for the given month Saturdays', async () => {
		vi.mocked(familyAssignment.getAll).mockResolvedValue([])

		const result = await createAssignments(conn, date)

		expect(result).toEqual({
			[DateTime.local(2025, 1, 4).toISODate() ?? '']: families
				.slice(0, 2)
				.map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			[DateTime.local(2025, 1, 11).toISODate() ?? '']: families
				.slice(2, 4)
				.map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			[DateTime.local(2025, 1, 18).toISODate() ?? '']: families
				.slice(4, 6)
				.map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			[DateTime.local(2025, 1, 25).toISODate() ?? '']: families
				.slice(6, 8)
				.map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
		})
		expect(shuffle).toHaveBeenCalled()
	})

	it('orders assignments by never assigned and then longest break', async () => {
		const neverAssigned = families.slice(0, 4)
		const recentlyAssigned = families.slice(4, 6)
		const recentDate = DateTime.local(2024, 11, 2).toJSDate()
		const assignedEarlier = families.slice(6)
		const earlierDate = DateTime.local(2024, 8, 3).toJSDate()
		const famAssignments: familyAssignment.FamilyAssignment[] = []
		for (const recentFam of recentlyAssigned) {
			famAssignments.push(generateFamilyAssignment({ familyId: recentFam.id, dateAssigned: earlierDate }))
			famAssignments.push(generateFamilyAssignment({ familyId: recentFam.id, dateAssigned: recentDate }))
		}
		for (const earlyFam of assignedEarlier) {
			famAssignments.push(generateFamilyAssignment({ familyId: earlyFam.id, dateAssigned: earlierDate }))
		}
		vi.mocked(familyAssignment.getAll).mockResolvedValue(famAssignments)

		const result = await createAssignments(conn, date)
		const assigned = Object.values(result).flat()

		for (const neverFam of neverAssigned) {
			expect(assigned.find(a => a.family.id === neverFam.id)).not.toBeNull()
		}
		for (const earlyFam of assignedEarlier) {
			expect(assigned.find(a => a.family.id === earlyFam.id)).not.toBeNull()
		}
		for (const recentFam of recentlyAssigned) {
			expect(assigned.find(a => a.family.id === recentFam.id)).toBeUndefined()
		}
	})
})
