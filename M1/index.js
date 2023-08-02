const express = require('express')
const Publish = require('./publisher')
const publish = new Publish()
const app = express()

app.use(express.json())


app.post('/log', async (req, res) => {
    const result = await publish.publisherMessage(req.body.message)
    let result2 = await publish.consumeData()
    if (result[0] === 400) {
        res.status(result[1]).json({ message: result[0] })
    } else {
        res.status(result[1]).json({ message: result[0], data: result2 })
    }
})

app.listen(8000, () => {
    console.log('Server start...')
})