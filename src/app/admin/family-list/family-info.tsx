import { Family, FamilyPerson } from '@/db/family'

interface FamilyInfoProps {
	family: Family
}
export default function FamilyInfo({ family }: FamilyInfoProps) {
	return (
		<div>
			<h2 className="font-semibold">{family.surname}</h2>
			<div className="inline-grid grid-rows-[1fr_auto] grid-cols-[8em_16em_1fr] gap-x-4 ps-4">
				<PersonInfo person={family.p1} />
				{family.p2 && <PersonInfo person={family.p2} />}
			</div>
		</div>
	)
}

interface PersonInfoProps {
	person: FamilyPerson
}
function PersonInfo({ person }: PersonInfoProps) {
	return (
		<>
			<ReadOnlyField label="name" value={person.name} />
			<ReadOnlyField label="email" value={person.email} />
			<ReadOnlyField label="phone" value={formatPhone(person.phone)} />
		</>
	)
}

function formatPhone(value?: string) {
	if (value) {
		return `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`
	}
}

interface ReadOnlyFieldProps {
	label: string
	value?: string
}
function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
	return (
		<div>
			<label className="font-semibold text-xs text-gray-500 uppercase">{label}</label>
			{value && <div className="whitespace-nowrap overflow-ellipsis overflow-hidden">{value}</div>}
		</div>
	)
}
