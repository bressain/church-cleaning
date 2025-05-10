import { type Connection, getScriptsDbFilePath, createDbConnection } from '../db/common'
import * as family from '../db/family'
import * as familyAssigment from '../db/family-assignment'

export default async function removeFamilyData(conn: Connection, familyId: string) {
	await familyAssigment.removeByFamily(conn, familyId)
	await family.remove(conn, familyId)
}

if (require.main === module) {
	const familyId = '0306411a-ec73-42b2-9117-c65199f7e448'
	createDbConnection(getScriptsDbFilePath(), true).then(async conn => {
		console.info(`Deleting family data for ${familyId}...`)
		await removeFamilyData(conn, familyId)
		console.info('Family data deleted')
		conn.close()
	})
}
