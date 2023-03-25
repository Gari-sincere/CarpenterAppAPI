const PocketBase = require('pocketbase/cjs')
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
async function createUser(token, email, phone, firstName, lastName, nickName, chatChannel) {

    const pb = new PocketBase(process.env.DATABASE_URL)

    pb.authStore = {
        baseToken: token
    }

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

async function start2Factor(userPhoneNum) {
    const pb = new PocketBase(process.env.DATABASE_URL)

    pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)

    const stuff = await pb.collection('users').requestPasswordReset('garison.cyr@gmail.com');

    console.log("stuff", stuff)

}

async function login() {

}

module.exports = { createUser, start2Factor }