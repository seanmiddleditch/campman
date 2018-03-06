const path = require('path')
const postgressConnectionStringParser = require('pg-connection-string')

// load .env configuration if any
require('dotenv').config()

const connectionString = postgressConnectionStringParser.parse(process.env.DATABASE_URL)

module.exports = {
    type: 'postgres',
    host: connectionString.host,
    port: connectionString.port,
    database: connectionString.database,
    username: connectionString.user,
    password: connectionString.password,
    migrations: [path.join(path.resolve('dist'), 'app', 'db', 'migrations', '*.js')],
    entities: [path.join(path.resolve('dist'), 'app', 'models', '*.js')],
    ssl: true
}