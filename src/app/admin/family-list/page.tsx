import FamilyList from './family-list'
import { getConnection } from '@/db/common'
import * as family from '@/db/family'
import { Suspense } from 'react'

export default async function Page() {
	const conn = await getConnection()
	const families = await family.getAll(conn)
	families.sort((a, b) => {
		if (a.surname < b.surname) return -1
		if (a.surname > b.surname) return 1
		return 0
	})

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<FamilyList families={families} />
		</Suspense>
	)
}
