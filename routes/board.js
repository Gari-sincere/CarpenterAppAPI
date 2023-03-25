const express = require("express")
const { createBoard } = require('../models/board')
const { addPost } = require('../models/post')
const { addMessage } = require('../models/message')
const { addUserToBoard } = require('../models/usersBoard')
const util = require('../services/util')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Board
 */

/**
* @swagger
* definitions:
*   schemas:
*     Board:
*       type: object
*       required:
*         - ownerId
*         - type
*         - moderated
*       properties:
*         ownerId:
*           type: string
*           description: the id of the user who owns the board
*         type:
*           type: string
*           description: the type of board ('bulletin' or 'message')
*         moderated:
*           type: boolean
*           description: does the board require users to generate post requests
*       example:
*         ownerId: 9dkqunfj7pfuu1d
*         type: bulletin
*         moderated: true
* /board:
*   post:
*     summary: Creates a new board
*     tags: [Board]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/Board'
*     responses:
*       200:
*         description: The board was created
*       404:
*         description: There is a problem in the board format
*       500:
*         description: Some error happened
*/

router.post("/", function (req, res) {
    const token = req.headers.authorization

    console.log("token", token)

    const { ownerId, type, moderated } = req.body;

    createBoard(token, ownerId, type, moderated).then(() => {
        res.sendStatus(201)
    })
})

/**
* @swagger
* /board/{boardId}/addUser/{userId}:
*   post:
*     summary: Adds a user to a board
*     tags: [Board]
*     parameters:
*      - in: path
*        name: boardId
*        schema:
*          type: string
*          default: vby9s78vj66mk4d
*        required: true
*        description: The id of the board
*      - in: path
*        name: userId
*        schema:
*          type: string
*          default: 9dkqunfj7pfuu1d
*        required: true
*        description: The id of the user
*     responses:
*       200:
*         description: The user was added to the board
*       404:
*         description: There is a problem with the userId or boardId
*       500:
*         description: Some error happened
*/

router.post("/:boardId/addUser/:userId", async function (req, res) {
    const token = req.headers.authorization
    const boardId = req.params.boardId;
    const userId = req.params.userId;

    addUserToBoard(token, boardId, userId)
        .then((newUsersBoardRecord) => {
            util.sendBoardWelcomeText(token, newUsersBoardRecord)
            res.sendStatus(200)
        })
        .catch((error) => {
            console.error(error)
            res.sendStatus(500)
        })
})

/**
* @swagger
* definitions:
*   schemas:
*     Post:
*       type: object
*       required:
*         - userId
*         - post
*       properties:
*         userId:
*           type: string
*           description: the id of the user who created the post
*         post:
*           type: string
*           description: the contents of the post
*       example:
*         userId: 9dkqunfj7pfuu1d
*         post: Hello World
* /board/{boardId}/post:
*   post:
*     summary: Creates a new post on a bulletin board
*     tags: [Board]
*     parameters:
*      - in: path
*        name: boardId
*        schema:
*          type: string
*          default: vby9s78vj66mk4d
*        required: true
*        description: The id of the board
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/Post'
*     responses:
*       200:
*         description: The post was added to the board
*       201:
*         description: The post is waiting for approval
*       404:
*         description: There is a problem with the userId or boardId
*       500:
*         description: Some error happened
*/

router.post("/:boardId/post", async function (req, res) {
    const token = req.headers.authorization
    const boardId = req.params.boardId;
    const userId = req.body.userId
    const post = req.body.post

    addPost(token, boardId, userId, post)
        .then((postRecord) => {
            util.notifyBulletinBoardMembers(token, boardId, postRecord)
            res.sendStatus(200)
        })
        .catch((error) => {
            console.error(error)
            res.sendStatus(500)
        })
})

/**
* @swagger
* definitions:
*   schemas:
*     AppMessage:
*       type: object
*       required:
*         - userId
*         - message
*       properties:
*         userId:
*           type: string
*           description: the id of the user who created the message
*         message:
*           type: string
*           description: the contents of the message
*       example:
*         userId: 9dkqunfj7pfuu1d
*         message: Hello World
* /board/{boardId}/message:
*   post:
*     summary: Creates a message on a message board from the Web App
*     tags: [Board]
*     parameters:
*      - in: path
*        name: boardId
*        schema:
*          type: string
*          default: vby9s78vj66mk4d
*        required: true
*        description: The id of the board
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/AppMessage'
*     responses:
*       200:
*         description: The message was sent
*       404:
*         description: There is a problem in the message format
*       500:
*         description: Some error happened
*/

router.post("/:boardId/message", async function (req, res) {
    const token = req.headers.authorization
    const boardId = req.params.boardId;
    const { userId, message } = req.body;

    addMessage(token, boardId, userId, "web", undefined, message)
        .then((messageRecord) => {
            util.notifyMessageBoardMembers(token, boardId, messageRecord)
            res.sendStatus(200)
        })
        .catch((error) => {
            console.error(error)
            res.sendStatus(500)
        })

})

module.exports = router;
