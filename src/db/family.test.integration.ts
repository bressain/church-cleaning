import { describe, expect, it } from 'vitest'
import { generateFamily, generateFamilyPerson } from '../test/mothers'
import * as family from './family'

describe('family', () => {
	describe('#insert', () => {
		it('inserts a family record', async ({ db }) => {
			if (!db) {
				expect.fail('db not initialized')
			}

			const testFamily = generateFamily({
				active: false,
				p1: generateFamilyPerson({
					phone: '0123456789',
					email: 'rando@gmail.com',
				}),
				p2: generateFamilyPerson({
					name: 'The Missus',
					phone: '9876543210',
					email: 'missus@gmail.com',
				}),
			})

			await family.insert(db, testFamily)
			const resFamily = (await family.getAll(db)).find(f => f.id === testFamily.id)

			expect(testFamily).toEqual(resFamily)
		})
	})
})
