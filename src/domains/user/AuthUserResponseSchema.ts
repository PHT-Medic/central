import ResponseSchema from "../../services/http/response/schema";

class AuthUserResponseSchema extends ResponseSchema {
    constructor() {
        super();

        this.fields = {
            id: [],
            name: [],
            email : [],
            created_at : [],
            updated_at : []
        };
    }
}

export default AuthUserResponseSchema;
