import { DateTime } from 'luxon'

export default function getSaturdayFromDate(date: Date) {
	const dateTime = DateTime.fromJSDate(date)
	return dateTime.startOf('week').plus({ day: 5 }).toJSDate()
}
