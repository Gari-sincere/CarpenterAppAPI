require('dotenv').config()

var express = require("express")
require('express-async-errors')
var bodyParser = require("body-parser")

const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

var cors = require('cors')
require('cross-fetch/polyfill')

const fs = require('fs');

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
        url: "http://localhost:3000"
      },
      {
        url: process.env.PUBLIC_ENDPOINT,
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
// app.use("/user", require("./routes/user"))
// app.use("/board", require("./routes/board"))
app.use("/imessage", require("./routes/imessage"))
app.use("/health", require("./routes/health"))
// app.use("/test", require("./routes/test"))

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
)

// Global error handler - route handlers/middlewares which throw end up here
app.use((err, req, res, next) => {
  console.error(err)
  fs.appendFileSync('error.log', `${err}\n`)
});

/**
 * Run App
 */

app.listen(PORT)

console.debug("Server listening on port: " + PORT)