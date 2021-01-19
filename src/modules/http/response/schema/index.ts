
const ResponseSchemaFieldRequired = 'required';
const ResponseSchemaFieldNullable = 'nullable';
const ResponseSchemaFieldToNull = 'toNull';

const ResponseSchemaFieldOptions = {
    ResponseSchemaFieldRequired,
    ResponseSchemaFieldNullable,
    ResponseSchemaFieldToNull
}

export {
    ResponseSchemaFieldRequired,
    ResponseSchemaFieldNullable,
    ResponseSchemaFieldOptions,
    ResponseSchemaFieldToNull
}

class ResponseSchema {
    protected fields: any;

    //--------------------------------------

    constructor() {

    }

    //----------------------------------------

    applySchemaOnEntities(entities: any) {
        if(!Array.isArray(entities)) {
            throw new Error('Das Format der Entities ist ungültig.');
        }

        let result: any = [];

        for(let i=0; i<entities.length; i++) {
            result[i] = this.applySchemaOnEntity(entities[i]);
        }

        return result;
    }

    /**
     *
     * @param entity
     */
    applySchemaOnEntity(entity: any) {
        if(typeof entity === 'undefined') {
            throw new Error('Das Entity ist nicht gültig.');
        }

        let ob: any = {};

        for(let key in this.fields) {
            if(!this.fields.hasOwnProperty(key)) {
                continue;
            }

            let options = this.fields[key];
            let value: any;

            for(let i=0; i < options.length; i++) {
                switch (options[i]) {
                    case ResponseSchemaFieldRequired:
                        break;
                    case ResponseSchemaFieldNullable:
                        if(entity.hasOwnProperty(key)) {
                            if(entity[key] === null || entity[key] === 'null') {
                                value = null;
                            }
                        }
                        break;
                    case ResponseSchemaFieldToNull:
                        if(!entity.hasOwnProperty(key) || typeof entity[key] === 'undefined') {
                            value = null;
                        }
                        break;
                }
            }

            if(typeof value === 'undefined') {
                if(!entity.hasOwnProperty(key)) {
                    throw new Error('Das Attribute ' + key + ' fehlt, daher kann da Schema nicht angewendet werden.');
                }

                value = entity[key];
            }

            ob[key] = this.formatSchemaField(key, value, entity);
        }

        return ob;
    }

    formatSchemaField(key: string, value: any, entity: any) {
        return value;
    }
}

export default ResponseSchema;
