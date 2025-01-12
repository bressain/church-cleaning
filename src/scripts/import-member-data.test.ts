import * as assignment from '../db/assignment'
import * as family from '../db/family'
import * as familyAssignment from '../db/family-assignment'
import { generateAssignment } from '../test/mothers'
import { createMockConnection } from '../test/util'
import importMemberData, { type RawData } from './import-member-data'

vi.mock('../db/common')
vi.mock('../db/assignment')
vi.mock('../db/family')
vi.mock('../db/family-assignment')

describe('import-member-data', () => {
	const conn = createMockConnection()

	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('imports family and assignment records', async () => {
		const assignments = [generateAssignment(), generateAssignment({ name: 'West Side' })]
		vi.mocked(assignment.getAll).mockResolvedValue(assignments)
		const rawData = [
			createRawMemberData({
				assignment_2023_1: 'Chapel',
				first_2023: '1/3/2023',
				assignment_2024_2: 'West Side',
				second_2024: '8/23/2024',
				notes: 'Afraid of politics',
				permission_given_date: '1/1/2023',
			}),
		]

		await importMemberData(conn, rawData)

		expect(vi.mocked(family).insert).toHaveBeenCalledWith(
			conn,
			expect.objectContaining({
				surname: 'Kenobi',
				available: true,
				p1: {
					name: 'Obi Wan',
					phone: '1234567890',
					email: 'obiwan@jedi.org',
				},
				p2: undefined,
				notes: 'Afraid of politics',
				permissionGivenDate: new Date('1/1/2023'),
			}),
		)
		expect(vi.mocked(familyAssignment).insert).toHaveBeenCalledWith(
			conn,
			expect.objectContaining({
				assignmentId: assignments[0].id,
				dateAssigned: new Date('1/3/2023'),
			}),
		)
		expect(vi.mocked(familyAssignment).insert).toHaveBeenCalledWith(
			conn,
			expect.objectContaining({
				assignmentId: assignments[1].id,
				dateAssigned: new Date('8/23/2024'),
			}),
		)
	})

	it('stops when errors are found', async () => {
		const assignments = [generateAssignment()]
		vi.mocked(assignment.getAll).mockResolvedValue(assignments)
		const rawData = [
			createRawMemberData({
				assignment_2023_1: 'East Side',
				first_2023: '1/3/2023',
			}),
		]

		await importMemberData(conn, rawData)

		expect(vi.mocked(family).insert).not.toHaveBeenCalled()
		expect(vi.mocked(familyAssignment).insert).not.toHaveBeenCalled()
	})

	it('cleans up the data', async () => {
		const assignments = [generateAssignment()]
		vi.mocked(assignment.getAll).mockResolvedValue(assignments)
		const rawData = [
			createRawMemberData({
				surname: 'Skywalker ',
				active: null,
				p1_name: ' Anakin',
				p1_phone: '+1 (123) 456-7890',
				p1_email: ' anakin@jedi.org',
				p2_name: 'Padme',
				p2_phone: '987.654.3210',
				p2_email: '',
			}),
		]

		await importMemberData(conn, rawData)

		expect(vi.mocked(family).insert).toHaveBeenCalledWith(
			conn,
			expect.objectContaining({
				surname: 'Skywalker',
				available: false,
				p1: {
					name: 'Anakin',
					phone: '1234567890',
					email: 'anakin@jedi.org',
				},
				p2: {
					name: 'Padme',
					phone: '9876543210',
					email: undefined,
				},
			}),
		)
	})
})

function createRawMemberData(overrides: Partial<RawData> = {}): RawData {
	return {
		surname: 'Kenobi',
		active: true,
		household_num: '1',
		p1_name: 'Obi Wan',
		p1_phone: '1234567890',
		p1_email: 'obiwan@jedi.org',
		p2_name: null,
		p2_phone: null,
		p2_email: null,
		assignment_2023_1: null,
		first_2023: null,
		assignment_2023_2: null,
		second_2023: null,
		assignment_2024_1: null,
		first_2024: null,
		assignment_2024_2: null,
		second_2024: null,
		notes: '',
		permission_given_date: null,
		...overrides,
	}
}
