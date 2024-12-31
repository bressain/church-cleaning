import type { Database } from 'sqlite3'
import * as assignment from './assignment'
const rawData = require('../../data/data.js')

interface ImportedData {
	surname: string
	p1_name: string
	p1_phone: string | null
	p1_email: string | null
	p2_name: string | null
	p2_phone: string | null
	p2_email: string | null
	household_num: string | null
	active: boolean
	assignment_2024_1: string | null
	first_2024: string | null
	assignment_2024_2: string | null
	second_2024: string | null
	assignment_2023_1: string | null
	first_2023: string | null
	assignment_2023_2: string | null
	second_2023: string | null
}

export default async function importData(db: Database) {
	const importedData: ImportedData[] = rawData.data
	const assignments = await assignment.getAll(db)
}
