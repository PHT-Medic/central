import {check, matchedData, validationResult} from "express-validator";
import LoggerService from "../../services/loggerService";
import UserResponseSchema from "../../domains/user/UserResponseSchema";
import {hashPassword} from "../../services/auth/helpers/authHelper";
import {getCustomRepository, getRepository} from "typeorm";
import {UserRepository} from "../../domains/user/repository";
import {applyRequestFilterOnQuery, queryFindPermittedResourcesForRealm} from "../../db/utils";
import {isPermittedToOperateOnRealmResource} from "../../services/auth/utils";
import {Realm} from "../../domains/realm";

//---------------------------------------------------------------------------------

export async function getUsersRouteHandler(req: any, res: any) {
    let { filter } = req.query;

    try {

        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const queryBuilder = userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.realm', 'realm');

        queryFindPermittedResourcesForRealm(queryBuilder, req.user.realm_id);

        applyRequestFilterOnQuery(queryBuilder, filter, {
            id: 'user.id',
            name: 'user.name'
        });

        let result = await queryBuilder.getMany();

        let userResponseSchema = new UserResponseSchema();

        result = userResponseSchema.applySchemaOnEntities(result);

        return res._respond({data: result});
    } catch (e) {
        console.log(e);
        return res._failServerError();
    }
}

export async function getUserRouteHandler(req: any, res: any) {
    let { id } = req.params;

    try {
        const userRepository = getCustomRepository<UserRepository>(UserRepository);
        const query = await userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.realm', 'realm')
            .andWhere("user.id = :id", {id});

        queryFindPermittedResourcesForRealm(query, req.user.realm_id);

        let result = await query.getOne();

        if(typeof result === 'undefined') {
            return res._failNotFound();
        }

        let userResponseSchema = new UserResponseSchema();

        result = userResponseSchema.applySchemaOnEntity(result);

        return res._respond({data: result});
    } catch (e) {
        return res._failNotFound();
    }
}

export async function getMeRouteHandler(req: any, res: any) {
    let userResponseSchema = new UserResponseSchema();

    const user = userResponseSchema.applySchemaOnEntity(req.user);
    const permissions = req.permissions;

    return res._respond({
        data: {
            ...user,
            permissions
        }
    });
}

export async function addUserRouteHandler(req: any, res: any) {
    if(!req.ability.can('add','user')) {
        return res._failForbidden();
    }

    await check('email').exists().normalizeEmail().isEmail().optional({nullable: true}).run(req);
    await check('name').exists().notEmpty().isLength({min: 5, max: 30}).run(req);
    await check('password').exists().isLength({min: 5, max: 512}).optional({nullable: true}).run(req);
    await check('realm_id').exists().notEmpty().custom((value: any) => {
        return getRepository(Realm).findOne(value).then((realm: Realm | undefined) => {
            if(typeof realm === 'undefined') {
                throw new Error('Der Realm wurde nicht gefunden.')
            }
        })
    }).run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: true});

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    const user = await userRepository.create(data);

    if(typeof user.password !== 'undefined' && user.password !== null) {
        user.password = await userRepository.hashPassword(user.password);
    }

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

export async function editUserRouteHandler(req: any, res: any) {
    let { id } = req.params;

    if(!req.ability.can('edit','user') && !req.user.id === id) {
        return res._failForbidden();
    }

    await check('email').exists().normalizeEmail().isEmail().optional({nullable: true}).run(req);
    await check('name').exists().notEmpty().isLength({min: 5, max: 30}).optional().run(req);
    await check('password').exists().isLength({min: 5, max: 512})
        .custom((value, {req, location, path}) => {
            if(value !== req.body.password_repeat) {
                throw new Error('Die Passwörter stimmen nicht überein.');
            } else {
                return value;
            }
        }).optional({nullable: true}).run(req);

    const validation = validationResult(req);
    if(!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const data = matchedData(req, {includeOptionals: false});
    if(!data) {
        return res._respondAccepted();
    }

    if(typeof data.password !== 'undefined') {
        data.password = await hashPassword(data.password);
    }

    const userRepository = getCustomRepository<UserRepository>(UserRepository);
    let user = await userRepository.findOne(id, {relations: ['realm']});
    if(typeof user === 'undefined') {
        return res._failNotFound();
    }

    if(!isPermittedToOperateOnRealmResource(req.user, user)) {
        return res._failForbidden();
    }

    user = userRepository.merge(user, data);

    try {
        const result = await userRepository.save(user);

        return res._respondAccepted({
            data: result
        });
    } catch (e) {
        return res._failValidationError({message: 'Die Benutzer Attribute konnten nicht aktualisiert werden.'});
    }
}

//---------------------------------------------------------------------------------

export async function dropUserRouteHandler(req: any, res: any) {
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
        const user = await userRepository.findOne(id);

        if(typeof user === 'undefined') {
            return res._failNotFound();
        }

        if(!isPermittedToOperateOnRealmResource(req.user, user)) {
            return res._failForbidden();
        }

        await userRepository.delete(id);

        return res._respondDeleted();
    } catch(e) {
        return res._failValidationError();
    }

}
