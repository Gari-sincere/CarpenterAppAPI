const PocketBase = require('pocketbase/cjs')
const twilioLib = require("../services/twilioFunctions.js")
const _ = require("underscore")

/**
 * Gets a list of all the twilio phone numbers that a user has in their board sms chats
 * @param {*} userId
 * @returns a list of the phone numbers that users account is already using
 */
async function getUsedPhones(userId) {
    // you can also fetch all records at once via getFullList

    const records = await pb.collection('usersBoard').getFullList(1000000, { filter: 'userId="' + userId + '" && active=True' })

    const phonesUsed = _.pluck(records, 'phoneUsed')

    return phonesUsed
}

/**
 * Creates a record in the 'usersBoard' table. See 'board' endpoint swagger for more
 * @param {*} boardId 
 * @param {*} userId 
 * @returns 
 */
async function addUserToBoard(token, boardId, userId) {

    const pb = new PocketBase(process.env.DATABASE_URL)

    pb.authStore = {
        baseToken: token
    }

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
        "emailUsed": "",
        "active": true
    }

    const record = await pb.collection('usersBoard').create(data)

    return record
}

/**
 * Creates a record in the 'usersBoard' table. See 'board' endpoint swagger for more
 * @param {*} boardId 
 * @param {*} userId 
 * @returns 
 */
async function removeUserFromBoard(token, boardId, userId) {

    const pb = new PocketBase(process.env.DATABASE_URL)

    pb.authStore = {
        baseToken: token
    }

    const startingRecord = await pb.collection('usersBoard').getFirstListItem('userId="' + userId + '" && boardId=' + boardId)

    // example update data
    const data = {
        "userId": startingRecord.userId,
        "boardId": startingRecord.boardId,
        "phoneUsed": startingRecord.phoneUsed,
        "emailUsed": startingRecord.emailUsed,
        "active": false
    };

    const newRecord = await pb.collection('usersBoard').update(startingRecord.id, data);

    return newRecord
}

module.exports = { addUserToBoard, removeUserFromBoard }