import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { DateTime } from 'luxon'
import * as assignment from '../db/assignment'
import { type Connection, getCreateDefaultDbFilePath, getDbConnection } from '../db/common'
import * as family from '../db/family'
import * as familyAssignment from '../db/family-assignment'
import type { MonthDate } from '../types'
import getSaturdaysInMonth from '../util/get-saturdays-in-month'
import shuffle from '../util/shuffle'

interface FamilyAndAssignment {
	family: family.Family
	assignment: assignment.Assignment
}
type MonthAssignments = Record<string, FamilyAndAssignment[]>

export default async function createAssignments(conn: Connection, monthDate: MonthDate): Promise<MonthAssignments> {
	const assignments = await assignment.getAll(conn)
	const families = await family.getAllAvailable(conn)
	const familyAssignments = await familyAssignment.getAll(conn)

	const saturdays = getSaturdaysInMonth(monthDate)
	const familiesWithoutPastAssignments = getFamiliesWithoutPastAssignments(familyAssignments, families)
	const familiesWithPastAssignments = getOrderedFamiliesWithPastAssignments(familyAssignments, families)
	const totalAssignmentsNeeded = saturdays.length * assignments.length

	const chosenFamilies =
		familiesWithoutPastAssignments.length < totalAssignmentsNeeded
			? [
					...familiesWithoutPastAssignments,
					...familiesWithPastAssignments.slice(0, totalAssignmentsNeeded - familiesWithoutPastAssignments.length),
				]
			: familiesWithoutPastAssignments.slice(0, totalAssignmentsNeeded)

	// shuffle in-place
	shuffle(chosenFamilies)

	const monthAssignments = new Map<string, FamilyAndAssignment[]>()
	for (const saturday of saturdays) {
		const famAssignments: FamilyAndAssignment[] = []

		for (const assign of assignments) {
			const fam = chosenFamilies.shift()
			if (!fam) {
				throw new Error('Bug in assignment generation')
			}
			famAssignments.push({ family: fam, assignment: assign })
		}

		monthAssignments.set(DateTime.fromJSDate(saturday).toISODate() ?? '', famAssignments)
	}

	return Object.fromEntries(monthAssignments)
}

function getFamiliesWithoutPastAssignments(
	familyAssignments: familyAssignment.FamilyAssignment[],
	families: family.Family[],
): family.Family[] {
	const familyIdsWithAssignments = new Set(familyAssignments.map(fa => fa.familyId))
	return families.filter(fam => !familyIdsWithAssignments.has(fam.id))
}

function getOrderedFamiliesWithPastAssignments(
	familyAssignments: familyAssignment.FamilyAssignment[],
	families: family.Family[],
): family.Family[] {
	// order by descending (latest ones first)
	const sortedFamilyAssignments = familyAssignments.toSorted(
		(a, b) => b.dateAssigned.valueOf() - a.dateAssigned.valueOf(),
	)
	const familiesById = families.reduce((acc, fam) => {
		acc.set(fam.id, fam)
		return acc
	}, new Map<string, family.Family>())

	const assignedFamilies = new Set<family.Family>()
	for (const fa of sortedFamilyAssignments) {
		const fam = familiesById.get(fa.familyId)
		// appeasing TS, this should always work
		if (fam) {
			// sortedFamilyAssignments is likely to have duplicate entries for families.
			// Adding them to a Set eliminates duplicates.
			assignedFamilies.add(fam)
		}
	}

	// flip to make the families with recent assignments be towards the end of the array
	return Array.from(assignedFamilies).toReversed()
}

export async function saveAssignmentsInDb(conn: Connection, monthAssignments: MonthAssignments): Promise<void> {
	for (const [saturday, assignments] of Object.entries(monthAssignments)) {
		const saturdayDate = new Date(saturday)
		for (const assign of assignments) {
			await familyAssignment.insert(conn, {
				id: randomUUID(),
				familyId: assign.family.id,
				assignmentId: assign.assignment.id,
				dateAssigned: saturdayDate,
			})
		}
	}
}

if (require.main === module) {
	getDbConnection(getCreateDefaultDbFilePath(), true).then(async conn => {
		const results = await createAssignments(conn, '2025-5')
		const lines: string[] = [
			'Date\tChapel\tEast Side\tWest Side\tGarbages / Windows\tGym / Stage / Kitchen\tEast Bathrooms\tWest Bathrooms',
		]
		for (const [saturday, assignments] of Object.entries(results)) {
			lines.push(
				[
					DateTime.fromISO(saturday).toLocaleString(),
					findFamilyNameByAssignment(assignments, 'chapel'),
					findFamilyNameByAssignment(assignments, 'east-side'),
					findFamilyNameByAssignment(assignments, 'west-side'),
					findFamilyNameByAssignment(assignments, 'garbages-windows'),
					findFamilyNameByAssignment(assignments, 'gym-stage-kitchen'),
					findFamilyNameByAssignment(assignments, 'east-bathrooms'),
					findFamilyNameByAssignment(assignments, 'west-bathrooms'),
				].join('\t'),
			)
		}
		fs.writeFileSync(path.resolve(__dirname, '../../data/assignments.tsv'), lines.join('\n'))

		// await saveAssignmentsInDb(conn, results)

		conn.close()
	})

	function findFamilyNameByAssignment(assignments: FamilyAndAssignment[], assignmentId: string): string {
		const fam = assignments.find(a => a.assignment.id === assignmentId)?.family
		if (!fam) {
			throw new Error('Missing assignment')
		}
		const p1Name = fam.p1.name.split(' ')[0]
		const name = fam.p2?.name ? `${p1Name} & ${fam.p2.name.split(' ')[0]}` : p1Name
		return `"${fam.surname}, ${name}"`
	}
}
