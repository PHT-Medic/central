import ResponseSchema, {
    ResponseSchemaFieldRequired, ResponseSchemaFieldToNull
} from "../../services/http/response/schema";

class UserResponseSchema extends ResponseSchema {
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

export default UserResponseSchema;
