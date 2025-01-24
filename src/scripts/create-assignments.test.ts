import { DateTime } from 'luxon'
import * as assignment from '../db/assignment'
import * as family from '../db/family'
import * as familyAssignment from '../db/family-assignment'
import { generateAssignment, generateFamily, generateFamilyAssignment, generateFamilyPerson } from '../test/mothers'
import { createMockConnection } from '../test/util'
import shuffle from '../util/shuffle'
import createAssignments, { saveAssignmentsInDb } from './create-assignments'

vi.mock('../db/common')
vi.mock('../db/assignment')
vi.mock('../db/family')
vi.mock('../db/family-assignment')
vi.mock('../util/shuffle')

describe('create-assignments', () => {
	const conn = createMockConnection()
	const monthDate = '2025-1'
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

		const result = await createAssignments(conn, monthDate)

		expect(result).toEqual({
			'2025-01-04': families.slice(0, 2).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			'2025-01-11': families.slice(2, 4).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			'2025-01-18': families.slice(4, 6).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			'2025-01-25': families.slice(6, 8).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
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

		const result = await createAssignments(conn, monthDate)
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

	it('handles other months', async () => {
		vi.mocked(familyAssignment.getAll).mockResolvedValue([])

		const result = await createAssignments(conn, '2025-2')

		expect(result).toEqual({
			'2025-02-01': families.slice(0, 2).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			'2025-02-08': families.slice(2, 4).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			'2025-02-15': families.slice(4, 6).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			'2025-02-22': families.slice(6, 8).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
		})
		expect(shuffle).toHaveBeenCalled()
	})

	describe('#saveAssignmentsInDb', () => {
		it('saves month assignments in the db', async () => {
			const monthAssignments = {
				'2025-01-04': families.slice(0, 2).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
				'2025-01-11': families.slice(2, 4).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
				'2025-01-18': families.slice(4, 6).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
				'2025-01-25': families.slice(6, 8).map((fam, idx) => ({ family: fam, assignment: assignments[idx] })),
			}

			await saveAssignmentsInDb(conn, monthAssignments)

			expect(familyAssignment.insert).toHaveBeenCalledTimes(8)
			expect(familyAssignment.insert).toHaveBeenCalledWith(
				conn,
				expect.objectContaining({
					familyId: families[0].id,
					assignmentId: assignments[0].id,
					dateAssigned: new Date('2025-01-04'),
				}),
			)
			expect(familyAssignment.insert).toHaveBeenCalledWith(
				conn,
				expect.objectContaining({
					familyId: families[2].id,
					assignmentId: assignments[0].id,
					dateAssigned: new Date('2025-01-11'),
				}),
			)
			expect(familyAssignment.insert).toHaveBeenCalledWith(
				conn,
				expect.objectContaining({
					familyId: families[4].id,
					assignmentId: assignments[0].id,
					dateAssigned: new Date('2025-01-18'),
				}),
			)
			expect(familyAssignment.insert).toHaveBeenCalledWith(
				conn,
				expect.objectContaining({
					familyId: families[6].id,
					assignmentId: assignments[0].id,
					dateAssigned: new Date('2025-01-25'),
				}),
			)
		})
	})
})
