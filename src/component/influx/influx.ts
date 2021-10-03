import {InfluxDB, IPoint} from "influx";
import {REEParsedResult} from "../importer/REEParser";
import {Expression} from "influx/lib/src/builder";

class InfluxManager
{
    private influx: InfluxDB;
    private readonly queryBuilder: typeof Expression;

    public constructor(influx: InfluxDB, dbname: string, queryBuilder: typeof Expression)
    {
        this.influx = influx
        this.queryBuilder = queryBuilder
    }

    static #lineParser (item): REEParsedResult {
        if (!item) {
            return null;
        }

        const time = item.time._nanoISO;
        return {
            date: (new Date(time)),
            priceKW: item.kw,
            priceMW: item.mw,
            priceCYMKW: item.kwCM,
            priceCYMMW: item.mwCM
        }
    };

    public async getHistorical(fromDate:Date = null, toDate:Date = null): Promise<REEParsedResult[]>
    {
        const queryBuilder = new this.queryBuilder

        if (fromDate) {
            queryBuilder.and.field('time').gte.value(fromDate.toISOString())
        }

        if (toDate) {
            queryBuilder.and.field('time').lte.value(toDate.toISOString())
        }

        //Remove first "and"
        const qbClause = queryBuilder.toString().slice(4)
        const whereClause = qbClause.length ? `where ${qbClause}` : ''

        const query = `SELECT "kw", "kwCM", "mw", "mwCM" FROM "price" ${whereClause} ORDER BY time DESC`
        const resultQuery = await this.influx.query(query);
        return resultQuery.map(InfluxManager.#lineParser)
    }

    public async getLastPoint(): Promise<REEParsedResult>
    {
        const query = `SELECT "kw", "kwCM", "mw", "mwCM" FROM "price" ORDER BY DESC LIMIT 1`
        const resultQuery = await this.influx.query(query)

        return InfluxManager.#lineParser(resultQuery[0]);
    }

    public async getLastDay ()  {
        const query = `SELECT "kw", "kwCM", "mw", "mwCM" FROM "price" ORDER BY time DESC LIMIT 24`
        const resultQuery = await this.influx.query(query)

        return resultQuery.map(InfluxManager.#lineParser)
    }

    private static createPoints(points: REEParsedResult[]): IPoint[]
    {
        return points.map(point => ({
            'measurement': 'price',
            fields: {
                mw: point.priceMW,
                mwCM: point.priceCYMMW,
                kw: point.priceKW,
                kwCM: point.priceCYMKW
            },
            timestamp: point.date
        }))
    }

    public async save(point: REEParsedResult|REEParsedResult[])
    {
        if (!Array.isArray(point)) {
            point = [point]
        }

        const points = InfluxManager.createPoints(point)

        await this.influx
            .writePoints(points, {
                precision: "s"
            })
    }
}

export default InfluxManager
