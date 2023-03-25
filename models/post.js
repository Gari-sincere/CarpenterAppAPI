const PocketBase = require('pocketbase/cjs')

/**
 * Creates a record in the 'post' table. See 'board' endpoint swagger for more
 * @param {*} boardId 
 * @param {*} userId 
 * @param {*} post 
 * @returns 
 */
async function addPost(token, boardId, userId, post) {

    const pb = new PocketBase(process.env.DATABASE_URL)

    pb.authStore = {
        baseToken: token
    }

    let userOwnsBoard

    try {
        const records = await pb.collection('board').getFirstListItem('id="' + boardId + '" && ownerId="' + userId + '"')

        userOwnsBoard = (records.length == 1)
    } catch (error) {
        userOwnsBoard = false
    }

    const approvedTime = (userOwnsBoard) ? new Date().toISOString() : undefined
    const postApprover = (userOwnsBoard) ? userId : undefined

    const data = {
        "boardId": boardId,
        "userId": userId,
        "post": post,
        "approved": approvedTime,
        "approvedBy": postApprover
    };


    const record = await pb.collection('post').create(data)

    return record
}

module.exports = { addPost }