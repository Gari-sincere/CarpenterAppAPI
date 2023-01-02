const pb = require("../models/db.js")
const _ = require("underscore")

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

async function sendMessage(from, to, message) {
    return client.messages.create({
        to: to,
        from: from,
        body: message,
        statusCallback: 'https://6a81-98-114-241-45.ngrok.io/sms/confirm',
    })
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

module.exports = { sendMessage, getAllPhones }