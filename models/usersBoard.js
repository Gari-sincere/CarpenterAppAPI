const pb = require("./db.js")
const twilioLib = require("../services/twilioFunctions.js")
const _ = require("underscore")

/**
 * Gets a list of all the twilio phone numbers that a user has in their board sms chats
 * @param {*} userId
 * @returns a list of the phone numbers that users account is already using
 */
async function getUsedPhones(userId) {
    // you can also fetch all records at once via getFullList

    const records = await pb.collection('usersBoard').getFullList(1000000, { filter: 'userId="' + userId + '"' })

    const phonesUsed = _.pluck(records, 'phoneUsed')

    return phonesUsed
}

/**
 * Creates a record in the 'usersBoard' table. See 'board' endpoint swagger for more
 * @param {*} boardId 
 * @param {*} userId 
 * @returns 
 */
async function addUserToBoard(boardId, userId) {

    let allPhones = await twilioLib.getAllPhones()
    let phonesUsed = await getUsedPhones(userId)
    let availablePhones = _.difference(allPhones, phonesUsed)

    if (availablePhones.length == 0) {
        throw Error("Boards currently doesn't own enough phone numbers to accomplish this task.")
    }

    const boardPhone = availablePhones[0]

    // example create data
    const data = {
        "userId": userId,
        "boardId": boardId,
        "phoneUsed": boardPhone,
        "emailUsed": ""
    }

    const record = await pb.collection('usersBoard').create(data)

    return record
}

module.exports = { addUserToBoard }