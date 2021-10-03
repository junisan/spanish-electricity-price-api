import {FastifyInstance} from "fastify";
import HighchartsFormatter from "../component/influx/HighchartsFormatter";

const validateDate = (date: any): Date => {

    if (date === null || typeof date === 'undefined') {
        return null
    }

    if (!isNaN(+date)) {
        date = +date
        const timestamp = date >= 10_000_000_000 ? date : date * 1000;
        return new Date(timestamp)
    }

    const dateJs = new Date(date)
    if (isNaN(dateJs.getTime())) {
        throw new Error('Not a valid date')
    }
    return dateJs

}

const api = (fastify: FastifyInstance, _, done) => {
    const getData = async (from: Date|null, to: Date|null) =>
        await fastify['influxManager'].getHistorical(from, to)

    fastify.get('/prices', async (request, reply) => {
        try{
            const from = validateDate(request.query['from']);
            const to = validateDate(request.query['to']);

            return await getData(from, to)
        }catch(e) {
            return reply.code(400).send({error: e.message})
        }
    })

    fastify.get('/pricesHighcharts', async (request, reply) => {
        try{
            const from = validateDate(request.query['from']);
            const to = validateDate(request.query['to']);

            const data = await getData(from, to)
            const formatter = new HighchartsFormatter()
            return formatter.format(data)

        } catch(e) {
            return reply.code(400).send({error: e.message})
        }

    })

    fastify.get('/pricesToday', async (request, reply) => {
        try{
            return await fastify['influxManager'].getLastDay()
        }
        catch (e) {
            return reply.code(400).send({error: e.message})
        }
    })

    done()
}

export default api
