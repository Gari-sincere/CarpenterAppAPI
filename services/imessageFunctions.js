const _ = require("underscore")

//
// CODE I MIGHT USE LATER TO CONVERT TIMES TO HEIC
//

// const http = require('http');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('ffmpeg-static').path;

// /**
//  * Download an image from a URL and convert it to HEIC format using FFmpeg.
//  * @param {string} imageUrl - The URL of the image to download and convert.
//  * @param {string} outputFilePath - The path where the converted HEIC file will be saved.
//  */
// async function downloadAndConvertImage(imageUrl, outputFilePath) {
//   // Download the image using the http module.
//   const response = await new Promise((resolve, reject) => {
//     http.get(imageUrl, (res) => {
//       if (res.statusCode !== 200) {
//         reject(new Error(`Failed to download image: ${res.statusCode}`));
//       }
//       let data = [];
//       res.on('data', (chunk) => {
//         data.push(chunk);
//       });
//       res.on('end', () => {
//         resolve(Buffer.concat(data));
//       });
//     }).on('error', reject);
//   });

//   // Convert the image to HEIC format using FFmpeg.
//   return new Promise((resolve, reject) => {
//     ffmpeg()
//       .setFfmpegPath(ffmpegPath)
//       .input(response)
//       .output(outputFilePath)
//       .outputOptions(['-f heic'])
//       .on('end', resolve)
//       .on('error', reject)
//       .run();
//   });
// }


async function sendIMessage(from, to, message) {
    let mediaUrls = message.match(/(https\:\/\/api\.twilio\.com\/[^ ]+|https\:\/\/firebasestorage\.googleapis\.com[^ ]+|https\:\/\/s3-external-1\.amazonaws\.com[^ ]+)/g)
    message = message.replace(/(https\:\/\/api\.twilio\.com\/[^ ]+ *|https\:\/\/firebasestorage\.googleapis\.com[^ ]+ *|https\:\/\/s3-external-1\.amazonaws\.com[^ ]+ *)/g, '')

    let messageObj = {
        recipient: "1" + String(to),
        sender_name: from,
        text: message,
        status_callback: `${process.env.PUBLIC_ENDPOINT}/imessage/status`,
    }

    // console.log("sending ", messageObj)

    if (mediaUrls && mediaUrls.length > 0)
        messageObj.attachments = mediaUrls

    return fetch(`${process.env.LOOPMESSAGE_URL}/api/v1/message/send/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.LOOPMESSAGE_AUTH_TOKEN,
            'Loop-Secret-Key': process.env.LOOPMESSAGE_SECRET_KEY
        },
        body: JSON.stringify(messageObj)
    })
}

async function getAlliMessageEmails() {
    let formatedPhoneNumbers
    await client.incomingPhoneNumbers.list((error, data) => {
        if (error) { throw error }
        else {
            const unformatedPhoneNumbers = _.pluck(data, 'phoneNumber')
            formatedPhoneNumbers = unformatedPhoneNumbers.map((curPhoneNumber) => parseInt(curPhoneNumber.match(/[^1+][0-9]{9}/g)[0]))
        }
    })
    return formatedPhoneNumbers
}

module.exports = { sendIMessage, getAlliMessageEmails }