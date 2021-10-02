import {config} from 'dotenv'
import REEParser from "../component/importer/REEParser";
import REEImporter from "../component/importer/REEImporter";
import InfluxManager from "../component/influx/influx";
import * as axios from 'axios'
import {InfluxDB} from "influx";
import {Expression} from "influx/lib/src/builder";

config()
const parser = new REEParser()
const importer = new REEImporter(axios, parser)
const influx = new InfluxDB(process.env.INFLUX_DSN)
const influxManager = new InfluxManager(influx, process.env.INFLUX_DDBB, Expression)

const getLastPointStored = async () => {
    const lastPoint = await influxManager.getLastPoint()
    return lastPoint ? lastPoint.date : new Date(2000,0,1);
}

const getFromApi = async () => {
    try {
        const results = await importer.getPrices();
        const lastStoredDate = await getLastPointStored();
        let points = [];

        results.forEach(result => {
            if (result.date > lastStoredDate) {
                points.push(result)
            }
        })

        if (points.length) {
            influxManager.save(points)
                .then(() => console.log('Imported '+ points.length + ' registers'))
        } else {
            console.log("Database is more updated than API response")
        }
    } catch (e) {
        throw e
    }
}

getFromApi()
