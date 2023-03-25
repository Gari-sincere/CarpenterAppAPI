const express = require("express")
const { testPbUserLogin } = require('../models/databaseFuntions')
const { start2Factor } = require('../models/user')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Test
 */

/**
* @swagger
* definitions:
*   schemas:
*     credentials:
*       type: object
*       required:
*         - username
*         - password
*       properties:
*         username:
*           type: string
*           description: the users username
*         password:
*           type: string
*           description: the users password
*       example:
*         username: 2153854211
*         password: 123456789
* /test:
*   post:
*     summary: A Testing Endpoint
*     tags: [Test]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/definitions/schemas/credentials'
*     responses:
*       200:
*         description: The test was successful
*       404:
*         description: There is a problem in the test format
*       500:
*         description: Some error happened
*/

router.post("/", async function (req, res) {
    const { username, password } = req.body;

    // console.log(username)
    // console.log(password)

    start2Factor(username)
    res.sendStatus(201)
})

module.exports = router;
