import {REEParsedResult} from "../importer/REEParser";

export interface Formatter {
    format(points: REEParsedResult[])
}
