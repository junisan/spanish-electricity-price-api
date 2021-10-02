import {Formatter} from "./FormatterInterface";
import {REEParsedResult} from "../importer/REEParser";

class HighchartsFormatter implements Formatter
{
    format(points: REEParsedResult[]) {
        let kwSerie = [], mwSerie = [], kwCMSerie = [], mwCMSerie = []
        points.forEach(item => {
            kwSerie.push([item.date.getTime(), item.priceKW])
            mwSerie.push([item.date.getTime(), item.priceMW])
            kwCMSerie.push([item.date.getTime(), item.priceCYMKW])
            mwCMSerie.push([item.date.getTime(), item.priceCYMMW])
        })

        return [kwSerie, mwSerie, kwCMSerie,mwCMSerie]
    }

}

export default HighchartsFormatter
