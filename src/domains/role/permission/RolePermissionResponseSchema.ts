import ResponseSchema, {
    ResponseSchemaFieldRequired, ResponseSchemaFieldToNull
} from "../../../services/http/response/schema";
import {prettifyName} from "../../../services/auth/helpers/permissionHelper";

class RolePermissionResponseSchema extends ResponseSchema {
    constructor() {
        super();

        this.fields = {
            id: [],
            role_id: [],
            permission_id: [],
            enabled: [ResponseSchemaFieldToNull],
            power: [ResponseSchemaFieldToNull],
            power_inverse: [ResponseSchemaFieldToNull],
            scope: [ResponseSchemaFieldToNull],
            condition: [ResponseSchemaFieldToNull],
            created_at : [],
            updated_at : []
        };
    }

    formatSchemaField(key: string, value: any, entity: any): any {
        switch (key) {
            case 'enabled':
                return value === 1;
            default:
                return super.formatSchemaField(key, value, entity);
        }

    }
}

export default RolePermissionResponseSchema;
