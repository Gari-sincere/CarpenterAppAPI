const pb = require("./db.js")

/**
 * Creates a record in the 'message' table. See 'board' endpoint swagger for more
 * @param {*} boardId 
 * @param {*} userId 
 * @param {*} message 
 * @returns 
 */
async function addMessage(boardId, userId, message) {

    const data = {
        "boardId": boardId,
        "userId": userId,
        "twilioSid": undefined,
        "channel": "web",
        "message": message
    }

    const record = await pb.collection('message').create(data)

    return record
}

module.exports = { addMessage }