export interface REEResultItem {
    Dia: string,
    Hora: string,
    PCB: string,
    CYM: string,
}

export interface REEResult {
    PVPC: [REEResultItem]
}

export interface REEParsedResult {
    date: Date,
    priceMW: number,
    priceKW: number,
    priceCYMMW: number
    priceCYMKW: number
}

class REEParser
{
    public parseResult(result: REEResult): REEParsedResult[]
    {
        return result.PVPC.map((line: REEResultItem) => this.parseLine(line))
    }

    protected roundNumber(number: number, decimals: number = 4): number
    {
        const multiplier = Math.pow(10, decimals);
        const n = parseFloat((number * multiplier).toFixed(11));
        return Math.round(n) / multiplier
    }

    public parseLine(line:REEResultItem): REEParsedResult
    {
        const dayParts = line.Dia.split('/')
        const month = +dayParts[1] - 1

        const date = new Date(+dayParts[2], month, +dayParts[0])
        const hour = line.Hora.substr(0,2)
        date.setHours(+hour)

        const price = +line.PCB.replace(/\./g, '').replace(',', '.');
        const priceCYM = +line.CYM.replace(/\./g, '').replace(',', '.');

        return {
            date: date,
            priceMW: price,
            priceCYMMW: priceCYM,
            priceKW: this.roundNumber(price/100),
            priceCYMKW: this.roundNumber(priceCYM/100),
        }
    }
}

export default REEParser
