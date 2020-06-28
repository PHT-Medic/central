import {UserPermissionModel} from "../../domains/user/permission/UserPermissionModel";
import {check, matchedData, validationResult} from "express-validator";
import AuthUserEntity from "../../domains/user/AuthUserEntity";
import UserModel from "../../domains/user/UserModel";
import {applyRequestFilter} from "../../db/helpers/queryHelper";
import LoggerService from "../../services/loggerService";
import UserResponseSchema from "../../domains/user/UserResponseSchema";
import {hashPassword} from "../../services/auth/helpers/authHelper";
import {up} from "../../db/migrations/20200604153435_auth";
import {cat} from "shelljs";

//---------------------------------------------------------------------------------

const getUsers = async (req: any, res: any) => {
    let { filter } = req.query;

    let query = UserModel()._findAll();

    applyRequestFilter(query,filter,['id','name']);

    let result = await query;

    let userResponseSchema = new UserResponseSchema();

    result = userResponseSchema.applySchemaOnEntities(result);

    return res._respond({data: result});
};

const getUser = async (req: any, res: any) => {
    let { id } = req.params;

    try {
        let query = UserModel()._findOne({
            id
        });

        let result = await query;

        let userResponseSchema = new UserResponseSchema();

        result = userResponseSchema.applySchemaOnEntity(result);

        return res._respond({data: result});
    } catch (e) {
        return res._failNotFound();
    }
};

const getMe = async (req: any, res: any) => {
    let permissions = await UserPermissionModel().getPermissions(req.user.id);

    return res._respond({
        data: {
            user: req.user,
            permissions: permissions
        }
    });
};

const addUser = async (req: any, res: any) => {
    if(!req.ability.can('add','user')) {
        return res._failForbidden();
    }

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});

    let ob: AuthUserEntity = {
        name: data.name,
        email: data.email,
        password: data.password
    };

    try {
        let result = await UserModel().createUser(ob);

        LoggerService.info('user "' + data.name + '" created...');

        return res._respondCreated({
            data: {
                id: result[0]
            }
        });
    } catch (e) {
        return res._failValidationError();
    }
}

const editUser = async (req: any, res: any) => {
    let { id } = req.params;

    if(!req.ability.can('edit','user') && !req.user.id === id) {
        return res._failForbidden();
    }

    await check('email').exists().normalizeEmail().isEmail().optional().run(req);
    await check('publicKey').exists().notEmpty().optional().run(req);
    await check('public_key').exists().notEmpty().optional().run(req);
    await check('name').exists().notEmpty().isLength({min: 5, max: 30}).optional().run(req);
    await check('password').exists().isLength({min: 5, max: 512})
        .custom((value, {req, location, path}) => {
            if(value !== req.body.passwordRepeat) {
                throw new Error('Die Passwörter stimmen nicht überein.');
            } else {
                return value;
            }
        }).optional().run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(data) {
        let updateData: any = {};

        for(let key in data) {
            if(!data.hasOwnProperty(key)) {
                return;
            }

            switch (key) {
                case 'password':
                    updateData[key] = await hashPassword(data[key]);
                    break;
                case 'name':
                case 'email':
                    updateData[key] = data[key];
                    break;
            }
        }

        if(updateData) {
            try {
                await UserModel()._update(updateData, id);
            } catch(e) {

            }

            return res._respondAccepted();
        }

        return res._failValidationError({message: 'Die Einstellungen konnten nicht aktualisiert werden.'});
    }

    return res._respond();
}

//---------------------------------------------------------------------------------

const dropUser = async (req: any, res: any) => {
    let {id} = req.params;

    if (!req.ability.can('drop', 'user')) {
        return res._failForbidden();
    }

    if(req.user.id === id) {
        return res._failValidationError({
            message: 'Der eigene Benutzer kann nicht gelöscht werden.'
        })
    }

    try {
        await UserModel()._drop(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }

}

//---------------------------------------------------------------------------------

export default {
    getUsers,
    getUser,
    getMe,
    addUser,
    editUser,
    dropUser
}
