import InfluxManager from "./component/influx/influx";
import {InfluxDB} from "influx";
import {Expression} from "influx/lib/src/builder";
import {config} from 'dotenv';
import fastify from "fastify";
import HighchartsFormatter from "./component/influx/HighchartsFormatter";

config()

const influx = new InfluxDB(process.env.INFLUX_DSN)
const influxManager = new InfluxManager(influx, process.env.INFLUX_DDBB, Expression)

const server = fastify()

server.decorate('influxManager', influxManager)

server.get('/ping', async (request, reply) => {
    const from = new Date(2021,9,1)
    const to = new Date(2021,9,1, 23)
    const data = await server['influxManager'].getHistorical(from, to)

    const formatter = new HighchartsFormatter()
    return formatter.format(data)
})

server.listen(8080, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
