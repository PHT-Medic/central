import ResponseSchema, {
    ResponseSchemaFieldRequired, ResponseSchemaFieldToNull
} from "../../modules/http/response/schema";

class RoleResponseSchema extends ResponseSchema {
    constructor() {
        super();

        this.fields = {
            id: [],
            name: [],
            provider_role_id: [],
            created_at: [],
            updated_at: []
        };
    }
}

export default RoleResponseSchema;
