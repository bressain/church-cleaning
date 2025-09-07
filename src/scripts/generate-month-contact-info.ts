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
	lines.push('')
	lines.push('')
	lines.push('Phone numbers for pre-month reminder')
	lines.push('')
	for (const fam of families) {
		lines.push(fam.surname)
		if (fam.p1.phone) {
			lines.push(fam.p1.phone)
		}
		if (fam.p2?.phone) {
			lines.push(fam.p2.phone)
		}
		lines.push('')
		lines.push(
			'Hi, this is Bro Dinkelman. Your family is scheduled to clean the church next month! Please check the following schedule for details: https://docs.google.com/spreadsheets/d/1GoHHdbj0OVX9Dd_-O8Hg-T392AtEKhI7rFO1c9JyoV8/edit?gid=0#gid=0',
		)
		lines.push('')
	}

	return lines
}

if (require.main === module) {
	createDbConnection(getScriptsDbFilePath(), true).then(async conn => {
		const lines = await generateMonthContactInfo(conn, '2025-08')
		fs.writeFileSync(path.resolve(__dirname, '../../data/month-contact-info.txt'), lines.join('\n'))
		conn.close()
	})
}
