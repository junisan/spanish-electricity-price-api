import {Axios} from "axios";
import REEParser, {REEResult} from "./REEParser";

class REEImporter {
    private axios: Axios;
    private parser: REEParser;
    
    public constructor(axios, parser: REEParser) {
        this.axios = axios
        this.parser = parser;
    }
    
    public async getPrices()
    {
        const result = await this.axios
            .get<REEResult>('https://api.esios.ree.es/archives/70/download_json');

        return this.parser.parseResult(result.data)
    }
}


export default REEImporter
