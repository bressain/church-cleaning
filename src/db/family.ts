import type { Database } from 'sqlite3'
import { execute, fetchAll } from './common'

export interface FamilyDto {
	id: string
	surname: string
	p1_name: string
	p1_phone: string | null
	p1_email: string | null
	p2_name: string | null
	p2_phone: string | null
	p2_email: string | null
	active: number
}

export interface FamilyPerson {
	name: string
	phone?: string
	email?: string
}
export interface Family {
	id: string
	surname: string
	p1: FamilyPerson
	p2?: FamilyPerson
	active: boolean
}

export async function insert(db: Database, family: Family): Promise<void> {
	const statement = `
insert into family(id, surname, p1_name, p1_phone, p1_email, p2_name, p2_phone, p2_email, active)
values (?, ?, ?, ?, ?, ?, ?, ?, ?)
`
	return execute(
		db,
		statement,
		family.id,
		family.surname,
		family.p1.name,
		family.p1.phone,
		family.p1.email,
		family.p2?.name,
		family.p2?.phone,
		family.p2?.email,
		family.active ? 1 : 0,
	)
}

export async function getAll(db: Database): Promise<Family[]> {
	return (
		await fetchAll<FamilyDto>(
			db,
			`
select id, surname, p1_name, p1_phone, p1_email, p2_name, p2_phone, p2_email, active
from family
	`,
		)
	).map(dtoToDomain)
}

function dtoToDomain(row: FamilyDto): Family {
	return {
		id: row.id,
		surname: row.surname,
		active: !!row.active,
		p1: {
			name: row.p1_name,
			phone: row.p1_phone ?? undefined,
			email: row.p1_email ?? undefined,
		},
		p2: row.p2_name
			? {
					name: row.p2_name,
					phone: row.p2_phone ?? undefined,
					email: row.p2_email ?? undefined,
				}
			: undefined,
	}
}
