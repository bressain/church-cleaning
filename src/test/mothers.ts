import { randomUUID } from 'node:crypto'
import type { Assignment } from '../db/assignment'
import type { Family, FamilyPerson } from '../db/family'
import type { FamilyAssignment } from '../db/family-assignment'

export const generateAssignment = (overrides: Partial<Assignment> = {}): Assignment => ({
	id: randomUUID(),
	name: 'Chapel',
	...overrides,
})

export const generateFamilyPerson = (overrides: Partial<FamilyPerson> = {}): FamilyPerson => ({
	name: 'Rando',
	...overrides,
})

export const generateFamily = (overrides: Partial<Family> = {}): Family => ({
	id: randomUUID(),
	available: true,
	surname: 'Calrissian',
	p1: generateFamilyPerson(),
	notes: '',
	permissionGivenDate: undefined,
	...overrides,
})

export const generateFamilyAssignment = (overrides: Partial<FamilyAssignment> = {}): FamilyAssignment => ({
	id: randomUUID(),
	familyId: randomUUID(),
	assignmentId: randomUUID(),
	dateAssigned: new Date(),
	...overrides,
})
