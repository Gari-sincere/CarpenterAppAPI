const PocketBase = require('pocketbase/cjs')

const connection = new PocketBase(process.env.DATABASE_URL)

connection.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)

module.exports = connection;