require('dotenv').config()

var express = require("express")
var bodyParser = require("body-parser")

const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

var cors = require('cors')
require('cross-fetch/polyfill')

const PORT = process.env.PORT || 3000;

/**
 * Configure swagger-ui-express options
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Boards API",
      version: "0.1.0",
      description: "",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"],
}

const specs = swaggerJsdoc(options)

/**
 * Configure app object
 */

const app = express()
app.use(cors())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(bodyParser.json())
app.use("/sms", require("./routes/sms"))
app.use("/user", require("./routes/user"))
app.use("/board", require("./routes/board"))
app.use("/imessage", require("./routes/imessage"))

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
)

/**
 * Run App
 */

app.listen(PORT)

console.debug("Server listening on port: " + PORT)