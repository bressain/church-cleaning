import fs from 'node:fs'
import path from 'node:path'
import { unparse } from 'papaparse'
import { type Connection, getCreateDefaultDbFilePath, getDbConnection } from '../db/common'
import * as family from '../db/family'

export default async function generateFamilyList(conn: Connection) {
	const families = await family.getAll(conn)
	families.sort((a, b) => {
		if (a.surname < b.surname) return -1
		if (a.surname > b.surname) return 1
		return 0
	})

	const csv = unparse(
		families.map(fam => ({
			id: fam.id,
			surname: fam.surname,
			available: fam.available,
			p1_name: fam.p1.name,
			p1_phone: fam.p1.phone,
			p1_email: fam.p1.email,
			p2_name: fam.p2?.name,
			p2_phone: fam.p2?.phone,
			p2_email: fam.p2?.email,
		})),
	)

	fs.writeFileSync(path.resolve(__dirname, '../../data/family-list.csv'), csv)
	if (require.main === module) {
		console.info(`Wrote file to ${path.resolve(__dirname, '../../data/family-list.csv')}`)
	}
}

if (require.main === module) {
	getDbConnection(getCreateDefaultDbFilePath(), true).then(async conn => {
		await generateFamilyList(conn)
		conn.close()
	})
}