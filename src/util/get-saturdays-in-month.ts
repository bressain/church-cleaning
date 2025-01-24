import { DateTime } from 'luxon'
import type { MonthDate } from '../types'

export default function getSaturdaysInMonth(monthDate: MonthDate): Date[] {
	const split = monthDate.split('-')
	const month = +split[1]
	const year = +split[0]
	const firstDay = DateTime.local(year, month, 1)
	const daysInMonth = firstDay.daysInMonth ?? 0

	const saturdays: Date[] = []
	for (let day = 1; day < daysInMonth; day++) {
		const date = DateTime.local(year, month, day)

		// 6 corresponds to Saturday
		if (date.weekday === 6) {
			saturdays.push(date.toJSDate())
		}
	}
	return saturdays
}
