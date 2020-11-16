import ResponseSchema, {
    ResponseSchemaFieldRequired, ResponseSchemaFieldToNull
} from "../../services/http/response/schema";

class RoleResponseSchema extends ResponseSchema {
    constructor() {
        super();

        this.fields = {
            id: [],
            name: [],
            keycloak_role_id: [],
            created_at: [],
            updated_at: []
        };
    }
}

export default RoleResponseSchema;
