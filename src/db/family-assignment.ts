import { type Connection, execute, fetchAll, fromDbString, toDbString } from './common'

interface FamilyAssignmentDto {
	id: string
	family_id: string
	assignment_id: string
	date_assigned: string
}

export interface FamilyAssignment {
	id: string
	familyId: string
	assignmentId: string
	dateAssigned: Date
}

export async function insert(conn: Connection, familyAssignment: FamilyAssignment): Promise<void> {
	const statement = `
insert into family_assignment(id, family_id, assignment_id, date_assigned)
values (?, ?, ?, ?)
`
	return execute(
		conn,
		statement,
		familyAssignment.id,
		familyAssignment.familyId,
		familyAssignment.assignmentId,
		toDbString(familyAssignment.dateAssigned),
	)
}

export async function getAll(conn: Connection): Promise<FamilyAssignment[]> {
	return (
		await fetchAll<FamilyAssignmentDto>(
			conn,
			`
select id, id, family_id, assignment_id, date_assigned
from family_assignment
	`,
		)
	).map(dtoToDomain)
}

function dtoToDomain(row: FamilyAssignmentDto): FamilyAssignment {
	return {
		id: row.id,
		familyId: row.family_id,
		assignmentId: row.assignment_id,
		dateAssigned: fromDbString(row.date_assigned),
	}
}
