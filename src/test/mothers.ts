import { randomUUID } from 'node:crypto'
import type { Family, FamilyPerson } from '../db/family'

export const generateFamilyPerson = (overrides: Partial<FamilyPerson> = {}): FamilyPerson => ({
	name: 'Rando',
	...overrides,
})

export const generateFamily = (overrides: Partial<Family> = {}): Family => ({
	id: randomUUID(),
	active: true,
	surname: 'Calrissian',
	p1: generateFamilyPerson(),
	...overrides,
})
