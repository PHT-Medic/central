import { NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { PermissionID, SecretType, isHex } from '@personalhealthtrain/ui-common';
import { Buffer } from 'buffer';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { extendUserSecretEnginePayload, runUserSecretValidation } from './utils';
import { UserSecretEntity } from '../../../../domains/auth/user-secret/entity';

export async function updateUserSecretRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const data = await runUserSecretValidation(req, 'update');

    const repository = getRepository(UserSecretEntity);

    let entity = await repository.findOne({
        id,
        realm_id: req.realmId,
        ...(!req.ability.hasPermission(PermissionID.USER_EDIT) ? { user_id: req.user.id } : {}),
    });

    if (typeof entity === 'undefined') {
        throw new NotFoundError();
    }

    if (
        data.type !== SecretType.PAILLIER_PUBLIC_KEY &&
        data.content !== entity.content &&
        !isHex(data.content)
    ) {
        data.content = Buffer.from(data.content, 'utf-8').toString('hex');
    }

    entity = repository.merge(entity, data);

    await repository.save(entity);

    await extendUserSecretEnginePayload(entity.user_id, entity.key, entity.content);

    return res.respond({ data: entity });
}
