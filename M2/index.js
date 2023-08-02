const config = require('./config')
const amqp = require('amqplib');


async function consumeMessages() {
    let result;
    const connection = await amqp.connect(config.rabbitMQ.url)
    const channel = await connection.createChannel();
    await channel.assertExchange(config.rabbitMQ.exchange, 'direct');


    const q = await channel.assertQueue("InfoQueue");
    await channel.bindQueue(q.queue, config.rabbitMQ.exchange, "Message")
    await channel.consume(q.queue, async (msg) => {
        const data = JSON.parse(msg.content)
        channel.publish(config.rabbitMQ.exchange, 'Receive', Buffer.from(JSON.stringify(data)))
        channel.ack(msg)
    })
}

consumeMessages()