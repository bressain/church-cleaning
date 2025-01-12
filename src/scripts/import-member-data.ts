import { randomUUID } from 'node:crypto'
import * as assignment from '../db/assignment'
import { type Connection, getScriptsDbFilePath, createDbConnection } from '../db/common'
import * as family from '../db/family'
import * as familyAssignment from '../db/family-assignment'

export interface RawData {
	surname: string
	p1_name: string
	p1_phone: string | null
	p1_email: string | null
	p2_name: string | null
	p2_phone: string | null
	p2_email: string | null
	household_num: string | null
	active: boolean | null
	assignment_2024_1: string | null
	first_2024: string | null
	assignment_2024_2: string | null
	second_2024: string | null
	assignment_2023_1: string | null
	first_2023: string | null
	assignment_2023_2: string | null
	second_2023: string | null
	notes: string
	permission_given_date: string | null
}

type AssignmentsByName = Map<string, assignment.Assignment>

export default async function importMemberData(conn: Connection, data: RawData[]) {
	const families: family.Family[] = []
	const assignments = await assignment.getAll(conn)
	const assignmentsByName = assignments.reduce<AssignmentsByName>((acc, assignment) => {
		acc.set(assignment.name, assignment)
		return acc
	}, new Map())
	const familyAssignments: familyAssignment.FamilyAssignment[] = []
	const errors: string[] = []

	for (const record of data) {
		const newFamily = createCleanFamilyRecord(record)
		families.push(newFamily)
		const familyAssignmentData = [
			getFamilyAssignmentData(assignmentsByName, record.assignment_2023_1, record.first_2023),
			getFamilyAssignmentData(assignmentsByName, record.assignment_2023_2, record.second_2023),
			getFamilyAssignmentData(assignmentsByName, record.assignment_2024_1, record.first_2024),
			getFamilyAssignmentData(assignmentsByName, record.assignment_2024_2, record.second_2024),
		]
		familyAssignments.push(...getFamilyAssignments(newFamily.id, familyAssignmentData))
		errors.push(...familyAssignmentData.filter(data => data != null && 'error' in data).map(data => data.error))
	}

	if (errors.length) {
		if (require.main === module) {
			console.error('Errors found: ', errors.join('; '))
		}
		return
	}

	if (require.main === module) {
		console.info(`Inserting ${families.length} families...`)
	}
	for (const fam of families) {
		await family.insert(conn, fam)
	}
	if (require.main === module) {
		console.info(`Inserting ${familyAssignments.length} family assignment records...`)
	}
	for (const famAssignment of familyAssignments) {
		await familyAssignment.insert(conn, famAssignment)
	}
}

function createCleanFamilyRecord(record: RawData): family.Family {
	return {
		id: randomUUID(),
		surname: record.surname.trim(),
		available: record.active ?? false,
		p1: {
			name: record.p1_name.trim(),
			phone: cleanPhoneNumber(record.p1_phone),
			email: cleanEmail(record.p1_email),
		},
		p2: record.p2_name?.trim()
			? {
					name: record.p2_name.trim(),
					phone: cleanPhoneNumber(record.p2_phone),
					email: cleanEmail(record.p2_email),
				}
			: undefined,
		notes: record.notes,
		permissionGivenDate: record.permission_given_date ? new Date(record.permission_given_date) : undefined,
	}
}

function cleanPhoneNumber(phone: string | null): string | undefined {
	if (!phone) return undefined

	// remove any non-digit characters
	let stripped = phone.replace(/\D/gm, '')
	if (stripped.length > 10) {
		stripped = stripped.slice(1)
	}
	return stripped || undefined
}

function cleanEmail(email: string | null): string | undefined {
	return email?.trim() || undefined
}

interface GetFamilyAssignmentDataSuccess {
	assignmentId: string
	dataAssigned: Date
}
interface GetFamilyAssignmentDataError {
	error: string
}
type GetFamilyAssignmentDataResult = GetFamilyAssignmentDataSuccess | GetFamilyAssignmentDataError | undefined
function getFamilyAssignmentData(
	assignments: AssignmentsByName,
	assignment: string | null,
	date: string | null,
): GetFamilyAssignmentDataResult {
	if (!assignment || !date) return undefined

	const assignmentId = assignments.get(assignment)?.id
	if (assignmentId) {
		try {
			return {
				assignmentId,
				dataAssigned: new Date(date),
			}
		} catch (error) {
			return { error: `Parse error: ${error}` }
		}
	} else {
		return { error: `Invalid assignment: '${assignment}'` }
	}
}

function getFamilyAssignments(
	familyId: string,
	assignmentData: GetFamilyAssignmentDataResult[],
): familyAssignment.FamilyAssignment[] {
	return assignmentData
		.filter(data => data != null && 'assignmentId' in data)
		.map(data => ({
			id: randomUUID(),
			familyId,
			assignmentId: data.assignmentId,
			dateAssigned: data.dataAssigned,
		}))
}

if (require.main === module) {
	createDbConnection(getScriptsDbFilePath(), true).then(async conn => {
		console.info('Running import...')
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		await importMemberData(conn, require('../../data/april-data.json'))
		console.info('Import complete')
		conn.close()
	})
}
