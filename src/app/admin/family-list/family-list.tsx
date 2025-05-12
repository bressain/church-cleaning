'use client'

import FamilyInfo from '@/app/admin/family-list/family-info'
import { Family } from '@/db/family'

interface FamilyListProps {
	families: Family[]
}
export default function FamilyList({ families }: FamilyListProps) {
	return (
		<div className="p-8">
			<h1 className="font-bold text-2xl pb-3">Family List</h1>
			<ul className="gap-2 flex flex-col">
				{families.map(fam => (
					<li key={fam.id}>
						<FamilyInfo family={fam} />
					</li>
				))}
			</ul>
		</div>
	)
}
