const _ = require("underscore")

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

async function sendSMSMessage(from, to, message) {
    let mediaUrls = message.match(/(https\:\/\/api\.twilio\.com\/[^ ]+|https\:\/\/firebasestorage\.googleapis\.com[^ ]+|https\:\/\/s3-external-1\.amazonaws\.com[^ ]+)/g)
    message = message.replace(/(https\:\/\/api\.twilio\.com\/[^ ]+ *|https\:\/\/firebasestorage\.googleapis\.com[^ ]+ *|https\:\/\/s3-external-1\.amazonaws\.com[^ ]+ *)/g, '')

    let messageObj = {
        to: to,
        from: from,
        body: message,
        statusCallback: `${process.env.PUBLIC_ENDPOINT}/sms/status`,
    }

    if (mediaUrls && mediaUrls.length > 0)
        messageObj.mediaUrl = mediaUrls

    return client.messages.create(messageObj)
}

async function getAllPhones() {
    let formatedPhoneNumbers
    await client.incomingPhoneNumbers.list((error, data) => {
        if (error) { throw error }
        else {
            const unformatedPhoneNumbers = _.pluck(data, 'phoneNumber')
            formatedPhoneNumbers = unformatedPhoneNumbers.map((curPhoneNumber) => parseInt(curPhoneNumber.match(/[^1+][0-9]{9}/g)[0]))
        }
    })
    return formatedPhoneNumbers
}

//Couldn't get this to work. Leaving for now
// function isRequestFromTwilio(req) {
//     const twilioSignature = req.headers['x-twilio-signature']
//     const authToken = process.env.TWILIO_AUTH_TOKEN
//     const url = req.headers['x-forwarded-proto'] + "://" + req.headers.host + "/sms/status"
//     const params = req.body

//     return require('twilio').validateRequest(authToken, twilioSignature, url, params)
// }

module.exports = { sendSMSMessage, getAllPhones }