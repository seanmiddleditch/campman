import * as postgressConnectionStringParser from 'pg-connection-string'
import {createConnection, Connection} from 'typeorm'
import * as models from '../models'
import * as path from 'path'

let _connection: Connection|null = null

export async function connectToDatabase(databaseURL: string) : Promise<Connection>
{
    const connectionOptions = postgressConnectionStringParser.parse(process.env.DATABASE_URL || '')

    console.log(`Connecting to database ${connectionOptions.database}@${connectionOptions.host}:${connectionOptions.port}`)
    _connection = await createConnection({
        type: 'postgres',
        host: connectionOptions.host || 'localhost',
        port: connectionOptions.port || 5432,
        username: connectionOptions.user || '',
        password: connectionOptions.password || '',
        database: connectionOptions.database || '',
        extra: {
            ssl: true,
        },
        entities: [
            models.CampaignModel,
            models.MembershipModel,
            models.TagModel,
            models.PageModel,
            models.ProfileModel,
            models.MediaModel,
            models.MediaStorageModel,
            models.MapModel,
            models.InvitationModel,
            models.CharacterModel,
            models.AdventureModel,
        ]
    })

    return _connection
}

export function connection() : Connection
{
    return _connection as Connection
}