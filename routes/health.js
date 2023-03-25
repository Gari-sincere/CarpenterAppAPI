const express = require("express")
const { testPbUserLogin } = require('../models/databaseFuntions')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Health
 */

/**
* @swagger
* /health:
*   get:
*     summary: A health check endpoint
*     tags: [Health]
*     responses:
*       200:
*         description: The test was successful
*       404:
*         description: There is a problem in the test format
*       500:
*         description: Some error happened
*/

router.get("/", async function (req, res) {
    console.log("Health Check.")
    res.sendStatus(201)
})

module.exports = router;
