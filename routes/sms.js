const express = require("express")
const PocketBase = require('pocketbase/cjs')
const { getBoardAndUserInfo, updateSmsDeliveryStatus } = require('../models/databaseFuntions')
const { addMessage } = require('../models/message')
const util = require('../services/util')
const router = express.Router()
const twilioLib = require("../services/twilioFunctions.js")
const twilio = require('twilio');
/**
 * @swagger
 * tags:
 *   name: SMS
 */

/**
* @swagger
* definitions:
*   schemas:
*     SMSOutboundMessage:
*       type: object
*       required:
*         - from
*         - to
*         - message
*       properties:
*         from:
*           type: number
*           description: the sender phone number
*         to:
*           type: number
*           description: the recipient phone number
*         message:
*           type: string
*           description: the message string
*       example:
*         from: 3854696828
*         to: 2153854210
*         message: Hello World
* /sms/send:
*   post:
*     summary: Sends an SMS message
*     tags: [SMS]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/SMSOutboundMessage'
*     responses:
*       200:
*         description: The message was sent
*       404:
*         description: There is a problem in the message format
*       500:
*         description: Some error happened
*/

router.post("/send", async function (req, res) {
    const token = req.headers.authorization
    const from = req.body.from
    const to = req.body.to
    const message = req.body.message

    //
    //this needs to be changed later. We need to check if the token is valid before sending the message
    //
    twilioLib.sendSMSMessage(from, to, message)
        .then((message) => {
            const messageSid = message.sid
            pb.addSms(token, messageSid)
            res.sendStatus(200)
        })
        .catch(err => {
            console.log(err)
            res.sendStatus(500)
        })
})

/**
* @swagger
* definitions:
*   schemas:
*     SMSInboundMessage:
*       type: object
*       required:
*         - From
*         - To
*         - Body
*       properties:
*         From:
*           type: string
*           description: the sender phone number
*         To:
*           type: string 
*           description: the recipient phone number
*         Body:
*           type: string
*           description: the message string
*       example:
*         From: "3854696828"
*         To: "2153854210"
*         Body: "Hello World"
* /sms/receive:
*   post:
*     summary: receives an SMS message
*     tags: [SMS]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/SMSInboundMessage'
*     responses:
*       200:
*         description: The message was sent
*       404:
*         description: There is a problem in the message format
*       500:
*         description: Some error happened
*/
router.post("/receive", twilio.webhook(), async function (req, res) {
    const from = req.body.From.match(/[^1+][0-9]{9}/g)[0]
    const to = req.body.To.match(/[^1+][0-9]{9}/g)[0]
    let message = req.body.Body
    const messageSid = req.body.MessageSid

    if (req.body.NumMedia > 0) {
        await twilioLib.sendSMSMessage(to, from, "Sorry, right now Carpenter doesn't support sending images, gifs, or videos. But this feature is coming soon. Rest assured, we have our best people working on it https://s3-external-1.amazonaws.com/media.twiliocdn.com/AC55722e83ce7c4a7354febd7639bd6538/fa001ecd317d3255280724bfe016d0c2")
        res.contentType = "text/html"
        res.status(200)
        res.send("<Response></Response>")
        return
    }
    //include the twilio links to any media that was sent.
    const mediaCount = req.body.NumMedia
    for (let i = 0; i < mediaCount; i++) { message = message + " " + req.body["MediaUrl" + i] }


    const pb = new PocketBase(process.env.DATABASE_URL)

    const token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    const { boardId, boardType, userId } = await getBoardAndUserInfo(token, from, to)

    if (boardType == "message") {
        addMessage(token, boardId, userId, "sms", messageSid, message)
            .then((messageRecord) => {
                util.notifyMessageBoardMembers(token, boardId, messageRecord)
                res.contentType = "text/html"
                res.send("<Response></Response>")
            })
            .catch((error) => {
                console.error(error)
                res.sendStatus(500)
            })
    } else if (boardType == "bulletin") {
        //Gonna put stuff here
    }

})

/**
* @swagger
* /sms/status:
*   post:
*     summary: updates the status of the delivery of an SMS message
*     tags: [SMS]
*     requestBody:
*       required: true
*     responses:
*       200:
*         description: The message status was updated
*       404:
*         description: There is a problem in the message format
*       500:
*         description: Some error happened
*/
router.post("/status", twilio.webhook(), async function (req, res) {
    const twilioSid = req.body.MessageSid
    const status = req.body.SmsStatus

    const pb = new PocketBase(process.env.DATABASE_URL)

    const token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    console.log("req.body", req.body)

    updateSmsDeliveryStatus(token, twilioSid, status)

    res.sendStatus(200)
})

module.exports = router;