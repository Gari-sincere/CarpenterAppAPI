const PocketBase = require('pocketbase/cjs')
const twilioLib = require("./twilioFunctions.js")
const imessageLib = require("./imessageFunctions.js")
const { addMessage } = require('../models/message')
const _ = require("underscore")

async function notifyBulletinBoardMembers(token, boardId, postRecord) {
    const pb = new PocketBase(process.env.DATABASE_URL)

    token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    const senderId = postRecord.userId

    //pull the record of the user who created the post to get their name / nickname
    const userRecord = await pb.collection('users').getOne(senderId)

    const post = "|[NEW POST]| by " + userRecord.nickName + ":\n\n" + postRecord.post + "\n\n|[END OF POST]|\nReplies to this message will be forwarded to " + userRecord.nickName


    const usersBoardRecords = await pb.collection('usersBoard').getFullList(1000000, { filter: 'boardId="' + boardId + '" && active=True', expand: 'userId' })

    const usersBoardRecordsByChatChannel = _.groupBy(usersBoardRecords, (curRecord) => curRecord.expand.userId.chatChannel)

    usersBoardRecordsByChatChannel.sms.forEach((curRecord) => {
        const boardPhone = curRecord.phoneUsed
        const userId = curRecord.expand.userId.id
        const userPhone = curRecord.expand.userId.phone

        //This prevents a user from getting their own message
        if (senderId == userId) { return }
        twilioLib.sendSMSMessage(boardPhone, userPhone, post).then(async (smsMessage) => {
            const data = {
                "messageId": undefined,
                "postId": postRecord.id,
                "recipientId": curRecord.expand.userId.id,
                "sentVia": "sms",
                "externalId": smsMessage.sid,
                "sent": undefined,
                "received": undefined
            }


            pb.collection('deliveryTracking').create(data)
        })
    })

}

async function notifyMessageBoardMembers(token, boardId, messageRecord) {

    const pb = new PocketBase(process.env.DATABASE_URL)

    await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)

    const senderId = messageRecord.userId

    //pull the record of the user who created the message to get their name / nickname
    const userRecord = await pb.collection('users').getOne(senderId)

    const message = userRecord.nickName + ": " + messageRecord.message

    const usersBoardRecords = await pb.collection('usersBoard').getFullList(1000000, { filter: 'boardId="' + boardId + '" && active=True', expand: 'userId' })

    const usersBoardRecordsByChatChannel = _.groupBy(usersBoardRecords, (curRecord) => curRecord.expand.userId.chatChannel)

    usersBoardRecordsByChatChannel.sms.forEach((curRecord) => {
        const boardPhone = curRecord.phoneUsed
        const userId = curRecord.expand.userId.id
        const userPhone = curRecord.expand.userId.phone

        //This prevents a user from getting their own message
        if (senderId == userId) { return }

        twilioLib.sendSMSMessage(boardPhone, userPhone, message).then(async (smsMessage) => {
            // console.log("smsMessage", smsMessage)

            const data = {
                "messageId": messageRecord.id,
                "postId": undefined,
                "recipientId": curRecord.expand.userId.id,
                "sentVia": "sms",
                "externalId": smsMessage.sid,
                "sent": undefined,
                "received": undefined
            }

            pb.collection('deliveryTracking').create(data)
        })
    })

    usersBoardRecordsByChatChannel.imessage.forEach((curRecord) => {
        const boardImessageEmail = curRecord.emailUsed
        const userId = curRecord.expand.userId.id
        const userPhone = curRecord.expand.userId.phone

        //This prevents a user from getting their own message
        if (senderId == userId) { return }

        imessageLib.sendIMessage(boardImessageEmail, userPhone, message).then(async (iMessage) => {
            iMessage = await iMessage.json()

            const data = {
                "messageId": messageRecord.id,
                "postId": undefined,
                "recipientId": curRecord.expand.userId.id,
                "sentVia": "imessage",
                "externalId": iMessage.message_id,
                "sent": undefined,
                "received": undefined
            }

            pb.collection('deliveryTracking').create(data)
        })
    })

}

/**
 * Sends the welcome message to a user after they join a board.
 * @param {*} usersBoardRecord 
 */
async function sendBoardWelcomeText(token, usersBoardRecord) {
    const pb = new PocketBase(process.env.DATABASE_URL)

    token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    const userId = usersBoardRecord.userId
    const boardId = usersBoardRecord.boardId
    const boardPhone = usersBoardRecord.phoneUsed

    //pull the record of the new user to get their phone, and name / nickname
    const userRecord = await pb.collection('users').getOne(userId)

    //pull the record of the board to get the board type
    const boardRecord = await pb.collection('board').getOne(boardId)

    const userNickname = userRecord.nickName
    const userPhone = userRecord.phone

    const instructionsString = (boardRecord.type === "message") ?
        "Replies you make here will be sent to the whole group (like a group chat)." :
        "Replies you make here will be sent to the creator of the last post."

    const message = "Hello, " + userNickname + ". You have been added to " + boardRecord.type + " board " + usersBoardRecord.boardId + ". " + instructionsString + " You say STOP at any time to stop receiving notifications."

    addMessage(token, boardId, userId, "web", undefined, message)
        .then((messageRecord) => {
            twilioLib.sendSMSMessage(boardPhone, userPhone, message).then(async (smsMessage) => {
                const data = {
                    "messageId": messageRecord.id,
                    "postId": undefined,
                    "recipientId": userId,
                    "sentVia": "sms",
                    "externalId": smsMessage.sid,
                    "sent": undefined,
                    "received": undefined
                }

                pb.collection('deliveryTracking').create(data)
            }).catch((error) => {
                console.error(error)
            })
        })
        .catch((error) => {
            console.error(error)
        })
}

/**
 * Sends the welcome message to a user after they join a board.
 * @param {*} usersBoardRecord 
 */
async function sendMediaNotSupportedImessage(from, to) {
    imessageLib.sendIMessage(from, to, message)
}

module.exports = { notifyBulletinBoardMembers, notifyMessageBoardMembers, sendBoardWelcomeText, sendMediaNotSupportedImessage }