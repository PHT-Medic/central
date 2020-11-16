import Knex from 'knex';
import connection from "./connection";

export interface ModelOptions {
    primaryKey?: string,
    softDelete?: boolean,
    created_at?: string | boolean,
    updated_at?: string | boolean,
    deleted_at?: string | boolean
}

export default function(table: string, db?: Knex, options?: ModelOptions) {
    options = options ?? {};
	const primaryKey = options.primaryKey || 'id';

	if(db === undefined) {
		db = connection;
	}

    //------------------------------------------------

    function createDates(data: { [key: string] : any }, operation: 'insert' | 'update' | 'delete') {
	    const currentDate = new Date().toISOString();

        let createdField = typeof options.created_at === 'boolean' ? 'created_at' : options.created_at;
        let updatedField = typeof options.updated_at === 'boolean' ? 'updated_at' : options.updated_at;
        let deletedField = typeof options.deleted_at === 'boolean' ? 'deleted_at' : options.deleted_at;

	    switch (operation) {
            case 'insert':
                if(options.created_at) {
                    data[createdField] = currentDate;
                }

                if(options.updated_at) {
                    data[updatedField] = currentDate;
                }
                break;
            case 'update':
                if(options.updated_at) {
                    data[updatedField] = currentDate;
                }
                break;
            case 'delete':
                if(options.deleted_at) {
                    data[deletedField] = currentDate;
                }
                break;
        }
    }

	//------------------------------------------------

	const findAll = () => {
		return db.from(table);
	};

	const find = (where: { [key: string] : any }) => {
		return db.from(table).where(where);
	};

    const findOne = (where?: { [key: string] : any } | null) => {
        let query = db.from(table);
        if(where) query.where(where);
        return query.first();
    }

    const findById = (id: number | string) => {
        let where: any = {};
        where[primaryKey] = id;

        return findOne(where);
    };

	const create = (data: { [key: string] : any } | { [key: string] : any }[]) => {
	    if(Array.isArray(data)) {
	        data.map((item) => {
                createDates(data, 'insert');
            })
        } else {
	        createDates(data, 'insert');
        }

		return db.insert(data).into(table)
	};

	const update = (data: { [key: string] : any }, id: any) => {
        createDates(data, 'update');
		return db.update(data).where({id}).from(table);
	};

	const drop = (id: any) => {
        let data : {[key: string] : any} = {};
        data[primaryKey] = id;

	    if(options.softDelete) {
            createDates(data, 'delete');

            return update(data,id);
        } else {
            return db.delete().from(table).where(data);
        }
	};

	const dropWhere = (where: { [key: string] : any }) => {
	    return db.delete().from(table).where(where);
    }

	const builder = () => {
		return db(table);
	};

	const getTable = () => table;

	return {
		getTable,
		builder,
        findOne,
		findAll,
        findById,
		find,
		create,
		update,
		drop,
        dropWhere
	}
}
