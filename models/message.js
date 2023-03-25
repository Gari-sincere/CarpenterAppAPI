const PocketBase = require('pocketbase/cjs')

/**
 * Creates a record in the 'message' table. See 'board' endpoint swagger for more
 * @param {*} boardId 
 * @param {*} userId 
 * @param {*} message 
 * @returns 
 */
async function addMessage(token, boardId, userId, createdVia, externalId, message) {

    const pb = new PocketBase(process.env.DATABASE_URL)

    await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)

    const data = {
        "boardId": boardId,
        "userId": userId,
        "createdVia": createdVia,
        "externalId": externalId,
        "message": message
    }

    const record = await pb.collection('message').create(data)

    return record
}

module.exports = { addMessage }