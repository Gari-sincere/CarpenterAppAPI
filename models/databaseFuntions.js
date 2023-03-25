const PocketBase = require('pocketbase/cjs')
const _ = require("underscore")

/**
 * Finds the boardId and userId of a message using the usersBoard table
 * @param {*} userContact the users email or phone number
 * @param {*} boardContact the boards email or phone number used for this users
 * @returns 
 */
async function getBoardAndUserInfo(token, userContact, boardContact) {

    const pb = new PocketBase(process.env.DATABASE_URL)

    token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    const keyBoardSearchString = (String(boardContact).includes("@")) ? "emailUsed='" + boardContact + "'" : "phoneUsed=" + boardContact

    //Find the userId and boardId for this message

    console.log(process.env.DATABASE_URL + "/api/collections/usersBoard/records?perPage=1000000&expand=userId,boardId&filter=(" + keyBoardSearchString + ")")
    // const records = await fetch(process.env.DATABASE_URL + '/api/collections/usersBoard/records?perPage=1000000&expand=userId,boardId&filter=(' + keyBoardFieldName + "='" + boardContact + "' && active=True)", {
    const records = (await (await fetch(process.env.DATABASE_URL + "/api/collections/usersBoard/records?perPage=1000000&expand=userId,boardId&filter=(" + keyBoardSearchString + ")", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
        }
        // body: JSON.stringify({ perPage: 1000000, expand: 'userId,boardId', filter: keyBoardFieldName + '=' + boardContact + ' && active=True' })
    })).json()).items
    // const records = await pb.collection('usersBoard').getFullList(1000000, )

    if (records.length == 0)
        return {
            boardId: undefined,
            boardType: undefined,
            userId: undefined
        }

    const keyRecordI = _.findIndex(records, (curRecord) => {
        const userEmail = curRecord.expand.userId.email
        const userPhone = curRecord.expand.userId.phone

        const curRecordUserContact = (curRecord.expand.userId === 'email') ? userEmail : userPhone
        return curRecordUserContact == userContact
    })



    return {
        boardId: records[keyRecordI].boardId,
        boardType: records[keyRecordI].expand.boardId.type,
        userId: records[keyRecordI].userId
    }
}

// async function waitForSmsToBeLogged(pb, twilioSid) {
//     // Subscribe to changes in any deliveryTracking record
//     pb.collection('deliveryTracking').subscribe('*', function (e) {
//         console.log(e.record);
//     });
// }

async function updateSmsDeliveryStatus(token, twilioSid, status) {

    const pb = new PocketBase(process.env.DATABASE_URL)

    token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    //sleep for 5 seconds
    await (new Promise((resolve) => { setTimeout(resolve, 5000) }))
    // const record = await waitForSmsToBeLogged(twilioSid)
    const record = startingRecord = await pb.collection('deliveryTracking').getFirstListItem('externalId="' + twilioSid + '"')

    const sent = (status == 'sent') ? new Date().toISOString() : record.sent
    const received = (status == 'delivered') ? new Date().toISOString() : record.received

    // example update data
    const data = {
        "messageId": record.messageId,
        "postId": record.postId,
        "recipientId": record.recipientId,
        "sentVia": record.sentVia,
        "externalId": record.twilioSid,
        "sent": sent,
        "received": received
    }

    await pb.collection('deliveryTracking').update(record.id, data)
}

async function updateIMessageDeliveryStatus(loopMessageId, status) {

    const pb = new PocketBase(process.env.DATABASE_URL)
    const token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    //sleep for 5 seconds
    await (new Promise((resolve) => { setTimeout(resolve, 5000) }))

    // const record = await waitForSmsToBeLogged(twilioSid)
    const record = startingRecord = await pb.collection('deliveryTracking').getFirstListItem('externalId="' + loopMessageId + '"')

    const sent = (status == 'message_sent') ? new Date().toISOString() : record.sent
    const received = (status == 'delivered') ? new Date().toISOString() : record.received

    // example update data
    const data = {
        "messageId": record.messageId,
        "postId": record.postId,
        "recipientId": record.recipientId,
        "sentVia": record.sentVia,
        "externalId": record.loopMessageId,
        "sent": sent,
        "received": received
    }

    await pb.collection('deliveryTracking').update(record.id, data)
}

function makePostRequest(url, data, authToken) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${authToken}`
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error making POST request:', error);
        });
}


async function testPbUserLogin(username, password) {
    const pb = new PocketBase(process.env.DATABASE_URL)

    // const stuff = await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)

    // pb.authStore = {
    //     baseToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODA0MDQ2MDUsImlkIjoibnA0eGkzbDB0MDQwdHRoIiwidHlwZSI6ImFkbWluIn0.oSlXIJSdqJcoEmhNEMLORp0COx_GdfP18o1izP0Ulo0'
    // }

    // console.log("stuff2", JSON.stringify(pb.authStore))

    // const data = await pb.collection('board').getFullList(1000)

    // console.log(data)

    // console.log("stuff", stuff)
    // console.log("stuff2", JSON.stringify(pb.authStore))

    const authData = await pb.collection('users').authWithPassword('2153854210', '123456789')
    // console.log(authData)

    // pb.authStore = {
    //     baseToken: authData.token
    // }

    // const data = await pb.collection('board').getFullList(1000)

    const data = {
        "ownerId": "9dkqunfj7pfuu1d",
        "type": "bulletin",
        "moderated": true
    }
    fetch(process.env.DATABASE_URL + '/api/collections/board/records', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${authData.token}`
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error making POST request:', error);
        });

    console.log("data", data)

    // pb.authStore.token = 

}

module.exports = { getBoardAndUserInfo, updateSmsDeliveryStatus, updateIMessageDeliveryStatus, testPbUserLogin }