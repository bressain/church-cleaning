import type { Database } from 'sqlite3'
import { fetchAll } from './common'

interface AssignmentDto {
	id: string
	name: string
}
export interface Assignment {
	id: string
	name: string
}

export async function getAll(db: Database): Promise<Assignment[]> {
	return (await fetchAll<AssignmentDto>(db, 'select id, name from assignment;')).map(dtoToDomain)
}

function dtoToDomain(row: AssignmentDto): Assignment {
	return { ...row }
}
