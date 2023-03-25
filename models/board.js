const PocketBase = require('pocketbase/cjs')

/**
 * Creates a record in the 'board' table. See 'board' endpoint swagger for more
 * @param {*} ownerId 
 * @param {*} type 
 * @param {*} moderated 
 * @returns 
 */
async function createBoard(token, ownerId, type, moderated) {

    // example create data
    const data = {
        "ownerId": ownerId,
        "type": type,
        "moderated": moderated
    }

    const response = await fetch(process.env.DATABASE_URL + '/api/collections/board/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
        },
        body: JSON.stringify(data)
    })

    console.log("response", response)

    return record
}

module.exports = { createBoard }