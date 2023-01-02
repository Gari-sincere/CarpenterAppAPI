const pb = require("./db.js")
const _ = require("underscore")

/**
 * Creates a record in the 'user' table. See 'user' endpoint swagger for more
 * @param {*} email 
 * @param {*} phone 
 * @param {*} firstName 
 * @param {*} lastName 
 * @param {*} nickName 
 * @param {*} chatChannel 
 */
async function createUser(email, phone, firstName, lastName, nickName, chatChannel) {

    // example create data
    const data = {
        "username": phone,
        "email": email,
        "emailVisibility": true,
        "password": phone,
        "passwordConfirm": phone,
        "phone": phone,
        "firstName": firstName,
        "lastName": lastName,
        "nickName": nickName,
        "chatChannel": chatChannel
    }


    const record = await pb.collection('users').create(data)

    return record
}

module.exports = { createUser }