import { PermissionID } from '@personalhealthtrain/ui-common';
import { ForbiddenError, NotFoundError } from '@typescript-error/http';
import { getRepository } from 'typeorm';
import { isPermittedForResourceRealm } from '@typescript-auth/domains';
import { ProposalEntity } from '../../../../domains/core/proposal/entity';
import { ExpressRequest, ExpressResponse } from '../../../../config/http/type';
import { runProposalValidation } from './utils';

export async function updateProposalRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    if (!req.ability.hasPermission(PermissionID.PROPOSAL_EDIT)) {
        throw new ForbiddenError();
    }

    const data = await runProposalValidation(req, 'update');
    if (!data) {
        return res.respondAccepted();
    }

    const repository = getRepository(ProposalEntity);
    let proposal = await repository.findOne(id);

    if (typeof proposal === 'undefined') {
        throw new NotFoundError();
    }

    if (!isPermittedForResourceRealm(req.realmId, proposal.realm_id)) {
        throw new ForbiddenError();
    }

    proposal = repository.merge(proposal, data);

    const result = await repository.save(proposal);

    return res.respondAccepted({
        data: result,
    });
}
