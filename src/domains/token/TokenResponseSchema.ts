import ResponseSchema, {
    ResponseSchemaFieldRequired
} from "../../services/http/response/schema";

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
