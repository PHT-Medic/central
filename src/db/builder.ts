import Knex from 'knex';
import connection from "./connection";

export default function(table: string, db?: Knex, primaryKey?: string) {
	primaryKey = primaryKey || 'id';

	if(db === undefined) {
		db = connection;
	}

	//------------------------------------------------

	const _findAll = () => {
		return db.from(table);
	};

	const _find = (where: object) => {
		return db.from(table).where(where);
	};

    const _findOne = (where?: object | null) => {
        let query = db.from(table);
        if(where) query.where(where);
        return query.first();
    }

    const _findById = (id: number | string) => {
        let where: any = {};
        where[primaryKey] = id;

        return _findOne(where);
    };

	const _create = (data: object | object[]) => {
		return db.insert(data).into(table)
	};

	const _update = (data: object, id: any) => {
		return db.update(data).where({id}).from(table);
	};

	const _drop = (id: any) => {
		return db.delete().from(table).where({id});
	};

	const _dropWhere = (where: object) => {
	    return db.delete().from(table).where(where);
    }

	const _builder = () => {
		return db(table);
	};

	const _getTable = () => table;

	return {
		_getTable,
		_builder,
        _findOne,
		_findAll,
        _findById,
		_find,
		_create,
		_update,
		_drop,
        _dropWhere
	}
}
