const pb = require("./db.js")

/**
 * Creates a record in the 'board' table. See 'board' endpoint swagger for more
 * @param {*} ownerId 
 * @param {*} type 
 * @param {*} moderated 
 * @returns 
 */
async function createBoard(ownerId, type, moderated) {

    // example create data
    const data = {
        "ownerId": ownerId,
        "type": type,
        "moderated": moderated
    }

    const record = await pb.collection('board').create(data)

    return record
}

module.exports = { createBoard }