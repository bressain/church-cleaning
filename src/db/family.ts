import { type Connection, execute, fetchAll, fromDbString, toDbString } from './common'

export interface FamilyDto {
	id: string
	surname: string
	p1_name: string
	p1_phone: string | null
	p1_email: string | null
	p2_name: string | null
	p2_phone: string | null
	p2_email: string | null
	available: number
	notes: string
	permission_given_date: string | null
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
	available: boolean
	notes: string
	permissionGivenDate: Date | undefined
}

export async function insert(conn: Connection, family: Family): Promise<void> {
	const statement = `
insert into family(id, surname, p1_name, p1_phone, p1_email, p2_name, p2_phone, p2_email, available, notes, permission_given_date)
values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`
	return execute(
		conn,
		statement,
		family.id,
		family.surname,
		family.p1.name,
		family.p1.phone,
		family.p1.email,
		family.p2?.name,
		family.p2?.phone,
		family.p2?.email,
		family.available ? 1 : 0,
		family.notes,
		family.permissionGivenDate ? toDbString(family.permissionGivenDate) : undefined,
	)
}

export async function getAll(conn: Connection): Promise<Family[]> {
	return (
		await fetchAll<FamilyDto>(
			conn,
			`
select id, surname, p1_name, p1_phone, p1_email, p2_name, p2_phone, p2_email, available, notes, permission_given_date
from family;
	`,
		)
	).map(dtoToDomain)
}

export async function getAllAvailable(conn: Connection): Promise<Family[]> {
	return (
		await fetchAll<FamilyDto>(
			conn,
			`
select id, surname, p1_name, p1_phone, p1_email, p2_name, p2_phone, p2_email, available, notes, permission_given_date
from family
where available <> 0;
	`,
		)
	).map(dtoToDomain)
}

function dtoToDomain(row: FamilyDto): Family {
	return {
		id: row.id,
		surname: row.surname,
		available: !!row.available,
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
		notes: row.notes,
		permissionGivenDate: row.permission_given_date ? fromDbString(row.permission_given_date) : undefined,
	}
}
