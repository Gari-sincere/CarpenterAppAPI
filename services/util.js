const pb = require("../models/db.js")
const twilioLib = require("./twilioFunctions.js")
const _ = require("underscore")

async function notifyBulletinBoardMembers(boardId, postRecord) {

    const senderId = postRecord.userId

    //pull the record of the user who created the post to get their name / nickname
    const userRecord = await pb.collection('users').getOne(senderId)

    const post = "|[NEW POST]| by " + userRecord.nickName + ":\n\n" + postRecord.post + "\n\n|[END OF POST]|\nReplies to this message will be forwarded to " + userRecord.nickName


    const usersBoardRecords = await pb.collection('usersBoard').getFullList(1000000, { filter: 'boardId="' + boardId + '"', expand: 'userId' })

    const usersBoardRecordsByChatChannel = _.groupBy(usersBoardRecords, (curRecord) => curRecord.expand.userId.chatChannel)

    usersBoardRecordsByChatChannel.sms.forEach((curRecord) => {
        const boardPhone = curRecord.phoneUsed
        const userId = curRecord.expand.userId.id
        const userPhone = curRecord.expand.userId.phone

        //This prevents a user from getting their own message
        if (senderId == userId) { return }
        twilioLib.sendMessage(boardPhone, userPhone, post).then(async (smsMessage) => {
            const data = {
                "messageId": undefined,
                "postId": postRecord.id,
                "recipientId": curRecord.expand.userId.id,
                "channel": "sms",
                "twilioSid": smsMessage.sid,
                "sent": undefined,
                "received": undefined
            }


            pb.collection('deliveryTracking').create(data)
        })
    })

}

async function notifyMessageBoardMembers(boardId, messageRecord) {

    const senderId = messageRecord.userId

    //pull the record of the user who created the message to get their name / nickname
    const userRecord = await pb.collection('users').getOne(senderId)

    const message = userRecord.nickName + ": " + messageRecord.message

    const usersBoardRecords = await pb.collection('usersBoard').getFullList(1000000, { filter: 'boardId="' + boardId + '"', expand: 'userId' })

    const usersBoardRecordsByChatChannel = _.groupBy(usersBoardRecords, (curRecord) => curRecord.expand.userId.chatChannel)

    usersBoardRecordsByChatChannel.sms.forEach((curRecord) => {
        const boardPhone = curRecord.phoneUsed
        const userId = curRecord.expand.userId.id
        const userPhone = curRecord.expand.userId.phone

        //This prevents a user from getting their own message
        if (senderId == userId) { return }

        twilioLib.sendMessage(boardPhone, userPhone, message).then(async (smsMessage) => {
            const data = {
                "messageId": messageRecord.id,
                "postId": undefined,
                "recipientId": curRecord.expand.userId.id,
                "channel": "sms",
                "twilioSid": smsMessage.sid,
                "sent": undefined,
                "received": undefined
            }


            pb.collection('deliveryTracking').create(data)
        })
    })

}

module.exports = { notifyBulletinBoardMembers, notifyMessageBoardMembers }