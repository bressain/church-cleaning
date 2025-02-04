import { generateFamily, generateFamilyPerson } from '../test/mothers'
import * as family from './family'

describe('family', () => {
	describe('#insert', () => {
		it('inserts a family record', async ({ conn }) => {
			if (!conn) {
				expect.fail('db not initialized')
			}

			const testFamily = generateFamily({
				available: false,
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

			await family.insert(conn, testFamily)
			const resFamily = (await family.getAll(conn)).find(f => f.id === testFamily.id)

			expect(testFamily).toEqual(resFamily)
		})
	})
})
