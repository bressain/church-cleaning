import getSaturdayFromDate from './get-saturday-from-date'

describe('getSaturdayFromDate', () => {
	it('gets the next Saturday from a given date', () => {
		expect(getSaturdayFromDate(new Date('2025/05/13'))).toEqual(new Date('2025/05/17'))
	})
})
