import {check, matchedData, validationResult} from "express-validator";
import LoggerService from "../../services/loggerService";
import UserResponseSchema from "../../domains/user/UserResponseSchema";
import {hashPassword} from "../../services/auth/helpers/authHelper";
import {getCustomRepository} from "typeorm";
import {UserRepository} from "../../domains/user/repository";
import {applyRequestFilterOnQuery} from "../../db/utils";

//---------------------------------------------------------------------------------

const getUsers = async (req: any, res: any) => {
    let { filter } = req.query;

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const queryBuilder = userRepository.createQueryBuilder('user');

    applyRequestFilterOnQuery(queryBuilder, filter, ['id', 'name']);

    let result = await queryBuilder.getMany();

    let userResponseSchema = new UserResponseSchema();

    result = userResponseSchema.applySchemaOnEntities(result);

    return res._respond({data: result});
};

const getUser = async (req: any, res: any) => {
    let { id } = req.params;

    try {
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        let result = await userRepository.findOne(id);

        if(typeof result === 'undefined') {
            return res._failNotFound();
        }

        let userResponseSchema = new UserResponseSchema();

        result = userResponseSchema.applySchemaOnEntity(result);

        return res._respond({data: result});
    } catch (e) {
        return res._failNotFound();
    }
};

const getMe = async (req: any, res: any) => {
    let userResponseSchema = new UserResponseSchema();

    const user = userResponseSchema.applySchemaOnEntity(req.user);
    const permissions = req.permissions;

    return res._respond({
        data: {
            ...user,
            permissions
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

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.create({
        name: data.name,
        email: data.email,
        password: await hashPassword(data.password)
    })

    try {
        const result = await userRepository.save(user);

        LoggerService.info('user "' + data.name + '" created...');

        return res._respondCreated({
            data: {
                id: result.id
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
    if(!data) {
        return res._respondAccepted();
    }

    let updateData: { [key: string] : any } = {};

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
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const user = await userRepository.findOne(id);
        if(typeof user !== 'undefined') {
            userRepository.merge(user, updateData);

            try {
                const result = await userRepository.save(user);

                return res._respondAccepted({
                    data: result
                });
            } catch (e) {
                return res._failValidationError({message: 'Die Einstellungen konnten nicht aktualisiert werden.'});
            }
        }

        return res._failValidationError({message: 'Der Benutzer konnte nicht gefunden werden.'});
    }
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
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        await userRepository.delete(id);

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
