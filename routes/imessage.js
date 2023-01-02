const express = require("express")
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: iMessage
 */

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
    console.log(req.body)

    const from = req.body.recipient.match(/[^1+][0-9]{9}/g)[0]
    const to = req.body.sender_name
    const message = req.body.text
    const messageSid = req.body.message_id

    res.sendStatus(200)

})

module.exports = router