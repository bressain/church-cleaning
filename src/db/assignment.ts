import { type Connection, fetchAll } from './common'

interface AssignmentDto {
	id: string
	name: string
}
export interface Assignment {
	id: string
	name: string
}

export async function getAll(conn: Connection): Promise<Assignment[]> {
	return (await fetchAll<AssignmentDto>(conn, 'select id, name from assignment;')).map(dtoToDomain)
}

function dtoToDomain(row: AssignmentDto): Assignment {
	return { ...row }
}
