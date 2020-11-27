import ResponseSchema, {
    ResponseSchemaFieldNullable,
    ResponseSchemaFieldRequired, ResponseSchemaFieldToNull
} from "../../services/http/response/schema";

class UserResponseSchema extends ResponseSchema {
    constructor() {
        super();

        this.fields = {
            id: [],
            name: [],
            email : [],
            realm: [ResponseSchemaFieldToNull],
            realm_id: [ResponseSchemaFieldToNull],
            created_at : [],
            updated_at : []
        };
    }
}

export default UserResponseSchema;
