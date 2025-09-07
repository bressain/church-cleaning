import fs from 'node:fs'
import path from 'node:path'
import { type Connection, getScriptsDbFilePath, createDbConnection } from '../db/common'
import * as family from '../db/family'

export default async function generateWeekContactInfo(conn: Connection, saturday: Date): Promise<string[]> {
	const families = await family.getAllByDate(conn, saturday)
	const lines: string[] = []

	lines.push('Phone #s for weekly reminders')
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
	}
	lines.push('')
	lines.push('Saturday reminder:')
	lines.push(
		'Hello there! This is Bro Dinkelman. Letting you know that your family is scheduled to clean the church next Saturday. If you are unable to make it, please make arrangements to swap with someone else. If you run into troubles, please let me know. Details can be found here: https://docs.google.com/spreadsheets/d/1GoHHdbj0OVX9Dd_-O8Hg-T392AtEKhI7rFO1c9JyoV8/edit?usp=sharing',
	)
	lines.push('')
	lines.push('')
	lines.push('Thursday reminder:')
	lines.push(
		"Final reminder for church building cleaning this Saturday at 8am. If you've traded with someone else, please ignore this message. Thanks again for helping share this ward responsibility!",
	)

	return lines
}

if (require.main === module) {
	createDbConnection(getScriptsDbFilePath(), true).then(async conn => {
		const lines = await generateWeekContactInfo(conn, new Date('2025-08-30'))
		fs.writeFileSync(path.resolve(__dirname, '../../data/week-contact-info.txt'), lines.join('\n'))
		conn.close()
	})
}
