/*
 * Copyright (c) 2021-2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { getRepository } from 'typeorm';
import {
    applyFields, applyFilters, applyPagination, applyRelations,
} from 'typeorm-extension';
import { check, matchedData, validationResult } from 'express-validator';
import {
    MASTER_REALM_ID,
    PermissionID,
    Station, deleteStationHarborProject, removeStationSecretsFromSecretEngine, saveStationSecretsToSecretEngine,
} from '@personalhealthtrain/ui-common';

import {
    Body, Controller, Delete, Get, Params, Post, Request, Response,
} from '@decorators/express';
import { ResponseExample, SwaggerTags } from 'typescript-swagger';
import { BadRequestError, ForbiddenError, NotFoundError } from '@typescript-error/http';
import { ForceLoggedInMiddleware } from '../../../../config/http/middleware/auth';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { ExpressValidationError } from '../../../../config/http/error/validation';

type PartialStation = Partial<Station>;
const stationExample = { name: 'University Tuebingen', realm_id: 'tuebingen', id: 1 };

@SwaggerTags('pht')
@Controller('/stations')
export class StationController {
    @Get('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialStation[]>([
        stationExample,
    ])
    async getMany(
        @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation[]> {
        return await getStationsRouteHandler(req, res) as PartialStation[];
    }

    @Post('', [ForceLoggedInMiddleware])
    @ResponseExample<PartialStation>(stationExample)
    async add(
        @Body() data: PartialStation,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation | undefined> {
        return await addStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @Get('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialStation>(stationExample)
    async getOne(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation | undefined> {
        return await getStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @Post('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialStation>(stationExample)
    async edit(
        @Params('id') id: string,
            @Body() data: PartialStation,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation | undefined> {
        return await editStationRouteHandler(req, res) as PartialStation | undefined;
    }

    @Delete('/:id', [ForceLoggedInMiddleware])
    @ResponseExample<PartialStation>(stationExample)
    async drop(
        @Params('id') id: string,
            @Request() req: any,
            @Response() res: any,
    ): Promise<PartialStation | undefined> {
        return await dropStationRouteHandler(req, res) as PartialStation | undefined;
    }
}

export async function getStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;
    const { fields } = req.query;

    const repository = getRepository(Station);
    const query = repository.createQueryBuilder('station')
        .where('station.id = :id', { id });

    // todo: should be implemented by assigning permissions to a service.
    const isPermittedService : boolean = typeof req.serviceId !== 'undefined' && req.realmId === MASTER_REALM_ID;
    if (
        req.ability.hasPermission(PermissionID.STATION_EDIT)
        || isPermittedService
    ) {
        applyFields(query, fields, {
            allowed: [
                'secure_id',
                'public_key',
                'email',
                'registry_project_account_name',
                'registry_project_account_token',
                'registry_project_id',
                'registry_project_webhook_exists',
                'vault_public_key_saved',
            ],
            defaultAlias: 'station',
        });
    }

    const entity = await query.getOne();

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    return res.respond({ data: entity });
}

export async function getStationsRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const {
        filter, page, fields, includes,
    } = req.query;

    const repository = getRepository(Station);
    const query = repository.createQueryBuilder('station');

    applyRelations(query, includes, {
        defaultAlias: 'station',
        allowed: ['realm'],
    });

    applyFilters(query, filter, {
        allowed: ['id', 'name', 'realm_id'],
        defaultAlias: 'station',
    });

    // todo: should be implemented by assigning permissions to a service.
    const isPermittedService : boolean = typeof req.serviceId !== 'undefined' && req.realmId === MASTER_REALM_ID;
    if (
        req.ability.hasPermission(PermissionID.STATION_EDIT)
        || isPermittedService
    ) {
        applyFields(query, fields, {
            allowed: [
                'secure_id',
                'public_key',
                'email',
                'registry_project_account_name',
                'registry_project_account_token',
                'registry_project_id',
                'registry_project_webhook_exists',
                'vault_public_key_saved',
            ],
            defaultAlias: 'station',
        });
    }

    const pagination = applyPagination(query, page, { maxLimit: 50 });

    const [entities, total] = await query.getManyAndCount();

    return res.respond({
        data: {
            data: entities,
            meta: {
                total,
                ...pagination,
            },
        },
    });
}

export async function addStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    if (!req.ability.hasPermission(PermissionID.STATION_ADD)) {
        throw new ForbiddenError();
    }

    await check('name').isLength({ min: 5, max: 100 }).exists().notEmpty()
        .run(req);
    await check('secure_id').isLength({ min: 1, max: 100 }).exists().matches(/^[a-zA-Z0-9-]*$/)
        .run(req);
    await check('public_key').isLength({ min: 5, max: 4096 }).exists().optional({ nullable: true })
        .run(req);
    await check('email').isLength({ min: 5, max: 256 }).exists().optional({ nullable: true })
        .run(req);
    await check('sync_public_key').isBoolean().optional().run(req);
    await check('realm_id').exists().notEmpty().run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });

    if (data.public_key) {
        const hexChecker = new RegExp('^[0-9a-fA-F]+$');

        if (!hexChecker.test(data.public_key)) {
            data.public_key = Buffer.from(data.public_key, 'utf8').toString('hex');
        }
    }

    const syncPublicKey: boolean | undefined = data.sync_public_key;

    if (typeof data.sync_public_key !== 'undefined') {
        delete data.sync_public_key;
    }

    const repository = getRepository(Station);

    const entity = repository.create(data);

    await repository.save(entity);

    if (syncPublicKey) {
        await saveStationSecretsToSecretEngine(entity.secure_id, {
            publicKey: entity.public_key,
        });

        await repository.update({
            id: entity.id,
        }, {
            vault_public_key_saved: true,
        });
    }

    return res.respond({ data: entity });
}

export async function editStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.STATION_EDIT)) {
        throw new ForbiddenError();
    }

    await check('name').isLength({ min: 5, max: 100 }).exists().optional()
        .run(req);
    await check('secure_id').isLength({ min: 1, max: 100 }).exists().matches(/^[a-zA-Z0-9-]*$/)
        .optional()
        .run(req);
    await check('public_key').isLength({ min: 5, max: 4096 }).exists().notEmpty()
        .optional({ nullable: true })
        .run(req);
    await check('email').isLength({ min: 5, max: 256 }).exists().optional({ nullable: true })
        .run(req);
    await check('sync_public_key').isBoolean().optional().run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        throw new ExpressValidationError(validation);
    }

    const data = matchedData(req, { includeOptionals: false });
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(Station);
    const query = repository.createQueryBuilder('station')
        .addSelect('station.secure_id')
        .addSelect('station.public_key')
        .where('station.id = :id', { id });

    let station = await query.getOne();

    if (typeof station === 'undefined') {
        throw new NotFoundError();
    }

    if (data.public_key && data.public_key !== station.public_key) {
        const hexChecker = new RegExp('^[0-9a-fA-F]+$');

        if (!hexChecker.test(data.public_key)) {
            data.public_key = Buffer.from(data.public_key, 'utf8').toString('hex');
        }
    }

    const syncPublicKey : boolean | undefined = data.sync_public_key;
    if (typeof data.sync_public_key !== 'undefined') {
        delete data.sync_public_key;
    }

    // If public key changes, than the key is not saved to vault.
    if (typeof data.public_key === 'string') {
        if (data.public_key !== station.public_key) {
            station.vault_public_key_saved = false;
        }
    }

    if (typeof data.secure_id === 'string') {
        // secure id changed -> remove vault project
        if (data.secure_id !== station.secure_id) {
            await removeStationSecretsFromSecretEngine(station.secure_id);
        }
    }

    station = repository.merge(station, data);

    if (syncPublicKey) {
        await saveStationSecretsToSecretEngine(station.secure_id, { publicKey: station.public_key });

        station.vault_public_key_saved = true;
    }

    const result = await repository.save(station);

    return res.respondAccepted({
        data: result,
    });
}

export async function dropStationRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id: idStr } = req.params;

    // tslint:disable-next-line:radix
    const id = parseInt(idStr);

    if (typeof id !== 'number' || Number.isNaN(id)) {
        throw new BadRequestError();
    }

    if (!req.ability.hasPermission(PermissionID.STATION_DROP)) {
        throw new ForbiddenError();
    }

    const repository = getRepository(Station);

    const entity = await repository.findOne(id);

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    await repository.remove(entity);

    await deleteStationHarborProject(entity.secure_id);
    await removeStationSecretsFromSecretEngine(entity.secure_id);

    return res.respondDeleted({ data: entity });
}
