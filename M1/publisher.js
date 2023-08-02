const amqp = require('amqplib')
const config = require('./config')

class Publish {
    channel;

    async createChannel() {
        const connection = await amqp.connect(config.rabbitMQ.url)
        const channel = await connection.createChannel()
        this.channel = channel
    }

    async publisherMessage(message) {
        if (!this.channel) {
            await this.createChannel()
        }

        await this.channel.assertExchange(config.rabbitMQ.exchange, "direct")
        const log = {
            message: message,
            dataTime: new Date()
        }
        let result = await this.channel.publish(config.rabbitMQ.exchange, 'Message', Buffer.from(JSON.stringify(log)))

        if (result) {
            return ['Сообщение было отправлено', 200]
        } else {
            return ['Сообщение небыло отправлено', 400]
        }
    }

    async consumeData() {
        let result;
        const connection = await amqp.connect(config.rabbitMQ.url)
        const channel = await connection.createChannel();
        await channel.assertExchange(config.rabbitMQ.exchange, 'direct');

        const q = await channel.assertQueue("ReceiveQueue");
        await channel.bindQueue(q.queue, config.rabbitMQ.exchange, "Receive")
        await channel.consume(q.queue, (msg) => {
            const data = JSON.parse(msg.content)
            result = data
            channel.ack(msg)
        })
        return result
    }
}

module.exports = Publish