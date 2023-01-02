const express = require("express")
const { getBoardAndUserInfo, updateSmsDeliveryStatus } = require('../models/databaseFuntions')
const { addMessage } = require('../models/message')
const router = express.Router()

const twilioLib = require("../services/twilioFunctions.js")
/**
 * @swagger
 * tags:
 *   name: SMS
 */

/**
* @swagger
* definitions:
*   schemas:
*     SMSMessage:
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
*             $ref: '#/definitions/schemas/SMSMessage'
*     responses:
*       200:
*         description: The message was sent
*       404:
*         description: There is a problem in the message format
*       500:
*         description: Some error happened
*/

router.post("/send", function (req, res) {
    const from = req.body.from
    const to = req.body.to
    const message = req.body.message

    twilioLib.sendMessage(from, to, message)
        .then((message) => {
            const messageSid = message.sid
            pb.addSms(messageSid)
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
*     SMSMessage:
*       type: object
*       required:
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
* /sms/receive:
*   post:
*     summary: receives an SMS message
*     tags: [SMS]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/SMSMessage'
*     responses:
*       200:
*         description: The message was sent
*       404:
*         description: There is a problem in the message format
*       500:
*         description: Some error happened
*/

router.post("/receive", async function (req, res) {
    const from = req.body.From.match(/[^1+][0-9]{9}/g)[0]
    const to = req.body.To.match(/[^1+][0-9]{9}/g)[0]
    let message = req.body.Body
    const messageSid = req.body.MessageSid

    //include the twilio links to any media that was sent.
    const numberOfMedia = req.body.NumMedia
    for (let i = 0; i < numberOfMedia; i++) { message = message + " " + req.body["MediaUrl" + i] }

    console.log("From", from)
    console.log("to", to)
    console.log("message", message)

    const { boardId, boardType, userId } = await getBoardAndUserInfo(from, to)

    if (boardType == "message") {
        addMessage(boardId, userId, message)
            .then((messageRecord) => {
                util.notifyMessageBoardMembers(boardId, messageRecord)
                res.sendStatus(200)
            })
            .catch((error) => {
                console.error(error)
                res.sendStatus(500)
            })
    } else {
        //Gonna put stuff here
    }

})

/**
* @swagger
* /sms/confirm:
*   post:
*     summary: confirms the delivery of an SMS message
*     tags: [SMS]
*     requestBody:
*       required: true
*     responses:
*       200:
*         description: The message was confirmed
*       404:
*         description: There is a problem in the message format
*       500:
*         description: Some error happened
*/

router.post("/confirm", function (req, res) {
    const twilioSid = req.body.MessageSid
    const status = req.body.SmsStatus

    updateSmsDeliveryStatus(twilioSid, status)

    res.sendStatus(200)
})

module.exports = router;