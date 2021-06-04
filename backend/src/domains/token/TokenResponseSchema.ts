import ResponseSchema, {
    ResponseSchemaFieldRequired
} from "../../modules/http/response/schema";

class TokenResponseSchema extends ResponseSchema {
    constructor() {
        super();

        this.fields = {
            token : [],
            expires_in : []
        };
    }
}

export default TokenResponseSchema;
