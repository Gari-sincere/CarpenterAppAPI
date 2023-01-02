const pb = require("./db.js")
const _ = require("underscore")

/**
 * Finds the boardId and userId of a message using the usersBoard table
 * @param {*} userContact the users email or phone number
 * @param {*} boardContact the boards email or phone number used for this users
 * @returns 
 */
async function getBoardAndUserInfo(userContact, boardContact) {

    const keyBoardFieldName = (String(boardContact).includes("@")) ? "emailUsed" : "phoneUsed"

    //Find the userId and boardId for this message

    const records = await pb.collection('usersBoard').getFullList(1000000, { expand: 'userId,boardId', filter: keyBoardFieldName + '=' + boardContact })

    const keyRecordI = _.findIndex(records, (curRecord) => {
        const userEmail = curRecord.expand.userId.email
        const userPhone = curRecord.expand.userId.phone

        const curRecordUserContact = (String(boardContact).includes("@")) ? userEmail : userPhone
        return curRecordUserContact == userContact
    })

    return {
        boardId: records[keyRecordI].boardId,
        boardType: records[keyRecordI].expand.boardId.type,
        userId: records[keyRecordI].userId
    }
}

async function updateSmsDeliveryStatus(twilioSid, status) {

    const record = await waitForSmsToBeLogged(twilioSid)

    const sent = (status == 'sent') ? new Date().toISOString() : record.sent
    const received = (status == 'delivered') ? new Date().toISOString() : record.received

    // example update data
    const data = {
        "messageId": record.messageId,
        "postId": record.postId,
        "recipientId": record.recipientId,
        "channel": record.channel,
        "twilioSid": record.twilioSid,
        "sent": sent,
        "received": received
    }
}

module.exports = { getBoardAndUserInfo, updateSmsDeliveryStatus }