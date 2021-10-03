import InfluxManager from "./component/influx/influx";
import {InfluxDB} from "influx";
import {Expression} from "influx/lib/src/builder";
import {config} from 'dotenv';
import fastify from "fastify";

import api from "./api/api";

config()

const influx = new InfluxDB(process.env.INFLUX_DSN)
const influxManager = new InfluxManager(influx, process.env.INFLUX_DDBB, Expression)

const server = fastify()

server.decorate('influxManager', influxManager)
server.register(api, {prefix: '/api'})

server.listen(3000, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})
