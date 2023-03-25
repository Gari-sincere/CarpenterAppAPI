const express = require("express")
const router = express.Router()
const PocketBase = require('pocketbase/cjs')
const { addMessage } = require('../models/message')
const { getBoardAndUserInfo, updateIMessageDeliveryStatus } = require('../models/databaseFuntions')
const util = require('../services/util')
const { sendIMessage } = require("../services/imessageFunctions")

/**
 * @swagger
 * tags:
 *   name: iMessage
 */

/**
 * @swagger
 * definitions:
 *   schemas:
 *     iMessageOutboundMessage:
 *       type: object
 *       required:
 *         - recipient
 *         - text
 *         - sender_name
 *       properties:
 *         recipient:
 *           type: string
 *           description: Phone number or Email.
 *         text:
 *           type: string
 *           description: your message text
 *         sender_name:
 *           type: string
 *           description: Your dedicated sender name. This parameter will be ignored if you send a request to a recipient who is added as a sandbox contact.
 *         attachments:
 *           type: array
 *           description: "Optional. An array of strings. The string must be a full URL of your image. URL should start with https://..., http links (without SSL) are not supported. This must be a publicly accessible URL: we will not be able to reach any URLs that are hidden or that require authentication. Max length of each URL: 256 characters, max elements in the array: 3."
 *         timeout:
 *           type: number
 *           description: "Value in seconds. If sending takes longer than the specified seconds, the request will be canceled. The value can't be less than 5 sec."
 *         passthrough:
 *           type: string
 *           description: "A string of metadata you wish to store with the checkout. Will be sent alongside all webhooks associated with the outbound message. Max length: 1000 characters."
 *         status_callback:
 *           type: string
 *           description: "The URL where you want to receive the status updates of the message. Check the Webhooks section for details. Max length: 256 characters."
 *         status_callback_header:
 *           type: string
 *           description: "The custom Authorization header will be contained in the callback. Max length: 256 characters."
 *       example:
 *         recipient: 2153854210
 *         text: "Hello World"
 *         sender_name: boardsapp1@gmail.com
 * /imessage/send:
 *   post:
 *     summary: Sends an iMessage message
 *     tags: [iMessage]
 *     parameters:
 *      - in: header
 *        name: Authorization
 *        schema:
 *          type: string
 *          default: GKQQ7RNWB-OZ6JJVFUS-NC5YM8RU6-7KQESXK3A
 *        required: true
 *        description: the 
 *      - in: header
 *        name: Loop-Secret-Key
 *        schema:
 *          type: string
 *          default: JublpxqsnpHPGrAV47iJAMf6TI_zOwtZLeV3oAF7tOFni8pEb-UGRLQ7Pk3u2Rro
 *        required: true
 *        description: secret key for the loop message account
 *      - in: header
 *        name: Content-Type
 *        schema:
 *          type: string
 *          default: application/json
 *        required: true
 *        description: The format of the request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/schemas/iMessageOutboundMessage'
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
    const from = req.body.sender_name
    const to = req.body.recipient
    const message = req.body.text
    const attachmentURLs = req.body.attachmentURLs



    //
    //this needs to be changed later. We need to check if the token is valid before sending the message
    //
    // twilioLib.sendSMSMessage(from, to, message)
    //     .then((message) => {
    //         const messageSid = message.sid
    //         pb.addSms(token, messageSid)
    //         res.sendStatus(200)
    //     })
    //     .catch(err => {
    //         console.log(err)
    //         res.sendStatus(500)
    //     })
})

/**
* @swagger
* definitions:
*   schemas:
*     iMessage:
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
* /imessage/receive:
*   post:
*     summary: receives an iMessage message
*     tags: [iMessage]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/iMessage'
*     responses:
*       200:
*         description: The message was sent
*       404:
*         description: There is a problem in the message format
*       500:
*         description: Some error happened
*/

router.post("/receive", async function (req, res) {
    //Check if request care from LoopMessage
    if (req.headers.authorization !== process.env.LOOPMESSAGE_SECRET_KEY) { res.sendStatus(401); return }

    const from = req.body.recipient.match(/[^1+][0-9]{9}/g)[0]
    const to = req.body.sender_name
    let message = req.body.text
    const messageSid = req.body.message_id

    if (req.body.attachments?.length > 0) {
        await sendIMessage(to, from, "Sorry, right now Carpenter doesn't support sending images, gifs, or videos. But this feature is coming soon. Rest assured, we have our best people working on it https://firebasestorage.googleapis.com:443/v0/b/loopserver-265a6.appspot.com/o/boardsapp1@imsg.chat%2F8A8657B9-371D-4704-990D-8972D63C652C-IMG_5769.heic?alt=media&token=3f7f3bc5-9d03-4353-974d-616a1ba57f05")
        res.sendStatus(200)
        return
    }
    // include the twilio links to any media that was sent.
    const mediaCount = req.body.attachments?.length
    for (let i = 0; i < mediaCount; i++) { message = message + " " + req.body.attachments[i] }

    const pb = new PocketBase(process.env.DATABASE_URL)

    const token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    const { boardId, boardType, userId } = await getBoardAndUserInfo(token, from, to)

    if (boardType == "message") {
        addMessage(token, boardId, userId, "imessage", messageSid, message)
            .then((messageRecord) => {
                util.notifyMessageBoardMembers(token, boardId, messageRecord)
            })
            .catch((error) => {
                console.error(error)
                res.sendStatus(500)
            })
    } else if (boardType == "bulletin") {
        //Gonna put stuff here
    }

    res.sendStatus(200)

})


/**
* @swagger
* /iMessage/status:
*   post:
*     summary: updates the status of the delivery of an iMessage message
*     tags: [iMessage]
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

router.post("/status", async function (req, res) {
    const loopMessageId = req.body.message_id
    const status = req.body.alert_type

    console.log("req.body", req.body)

    const pb = new PocketBase(process.env.DATABASE_URL)
    const token = (await pb.admins.authWithPassword(process.env.DATABASE_USER, process.env.DATABASE_PASS)).token

    updateIMessageDeliveryStatus(loopMessageId, status)

    res.sendStatus(200)
})

module.exports = router