import fs from 'node:fs'
import path from 'node:path'
import { type Connection, getScriptsDbFilePath, createDbConnection } from '../db/common'
import * as family from '../db/family'
import type { MonthDate } from '../types'

export default async function generateMonthContactInfo(conn: Connection, monthDate: MonthDate): Promise<string[]> {
	const families = await family.getAllByMonth(conn, monthDate)
	const lines: string[] = []

	lines.push('Emails for pre-month reminder')
	lines.push('')
	lines.push(
		families
			.reduce<string[]>((acc, fam) => {
				if (fam.p1.email) {
					acc.push(fam.p1.email)
				}
				if (fam.p2?.email) {
					acc.push(fam.p2.email)
				}
				return acc
			}, [])
			.join(';'),
	)

	return lines
}

if (require.main === module) {
	createDbConnection(getScriptsDbFilePath(), true).then(async conn => {
		const lines = await generateMonthContactInfo(conn, '2025-02')
		fs.writeFileSync(path.resolve(__dirname, '../../data/month-contact-info.txt'), lines.join('\n'))
		conn.close()
	})
}
