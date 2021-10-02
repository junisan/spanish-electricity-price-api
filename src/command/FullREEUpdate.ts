import {config} from 'dotenv'
import REEParser, {REEParsedResult} from "../component/importer/REEParser";
import InfluxManager from "../component/influx/influx";
import { promises as fs } from "fs";
import {InfluxDB} from "influx";
import {Expression} from "influx/lib/src/builder";

config()
const parser = new REEParser()
const influx = new InfluxDB(process.env.INFLUX_DSN)
const influxManager = new InfluxManager(influx, process.env.INFLUX_DDBB, Expression)

const importData = (content): REEParsedResult[] => {
    const json = JSON.parse(content)
    return parser.parseResult(json)
}

const readFile = async (filename:string): Promise<REEParsedResult[]> => {
    try{
        const content = await fs.readFile(filename, 'utf-8')
        return importData(content)
    }
    catch (e) {
        throw e
    }
}

const readdir = async (dirname: string)  => {
    if (dirname.slice(-1) !== '/') {
        dirname = dirname + '/'
    }

    let prices = [];
    try {
        const files = await fs.readdir(dirname)

        for(let i = 0; i < files.length; i++ ) {
            const file = files[i]
            const pricesInFile = await readFile(dirname + file)
            prices.push(pricesInFile)
        }

        return prices;
    }
    catch (e) {
        throw e
    }
}




readdir(__dirname + '/' + '../../data')
    .then(results => {
        const plainResults = results.flat()
        influxManager.save(plainResults)
            .then(() => console.log('Imported '+ plainResults.length + ' registers'))
    })
