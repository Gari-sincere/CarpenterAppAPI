const express = require("express")
const { createUser } = require('../models/user')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: User
 */

/**
* @swagger
* definitions:
*   schemas:
*     user:
*       type: object
*       required:
*         - email
*         - phone
*         - firstName
*         - lastName
*         - nickName
*         - chatChannel
*       properties:
*         email:
*           type: string
*           description: the users email
*         phone:
*           type: number
*           description: the users phone number
*         firstName:
*           type: string
*           description: the users first name
*         lastName:
*           type: string
*           description: the users last name
*         nickName:
*           type: string
*           description: the users nickname
*         chatChannel:
*           type: string
*           description: the users preferend communication channel
*       example:
*         email: user@gmail.com
*         phone: 2153854210
*         firstName: John
*         lastName: Doe
*         nickName: Johnny
*         chatChannel: sms
* /user:
*   post:
*     summary: Creates a new user
*     tags: [User]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/user'
*     responses:
*       200:
*         description: The user was created
*       404:
*         description: There is a problem in the user format
*       500:
*         description: Some error happened
*/

router.post("/", async function (req, res) {
    const token = req.headers.authorization
    const { email, phone, firstName, lastName, nickName, chatChannel } = req.body;

    createUser(token, email, phone, firstName, lastName, nickName, chatChannel).then(() => {
        res.sendStatus(201)
    })
})

module.exports = router;
