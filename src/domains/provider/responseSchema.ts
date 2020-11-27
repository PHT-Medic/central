import ResponseSchema, {
    ResponseSchemaFieldRequired, ResponseSchemaFieldToNull
} from "../../services/http/response/schema";
import {prettifyName} from "../../services/auth/helpers/permissionHelper";

class AuthenticatorResponseSchema extends ResponseSchema {
    constructor() {
        super();

        this.fields = {
            id: [],
            name: [],
            scheme: [],

            name_pretty: [ResponseSchemaFieldToNull],
            title: [ResponseSchemaFieldToNull],
            description: [ResponseSchemaFieldToNull],
            power_configurable: [ResponseSchemaFieldToNull],
            power_inverse_configurable: [ResponseSchemaFieldToNull],
            scope_configurable: [ResponseSchemaFieldToNull],
            created_at : [ResponseSchemaFieldToNull],
            updated_at : [ResponseSchemaFieldToNull]
        };
    }

    formatSchemaField(key: string, value: any, entity: any): any {
        switch (key) {
            case 'name_pretty':
                if(entity.hasOwnProperty('name') && typeof entity.name === 'string') {
                    value = prettifyName(entity.name);
                }

                return value;
            case 'power_configurable':
            case 'power_inverse_configurable':
            case 'scope_configurable':
                return value === 1;
            default:
                return super.formatSchemaField(key, value, entity);
        }

    }
}

export default PermissionResponseSchema;
