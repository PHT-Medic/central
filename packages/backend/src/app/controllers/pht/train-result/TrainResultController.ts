import {check, matchedData, validationResult} from "express-validator";
import {getRepository} from "typeorm";
import {TrainResult} from "../../../../domains/pht/train-result";
import {createResultServiceResultCommand} from "../../../../domains/service/result-service/queue";
import {HARBOR_OUTGOING_PROJECT_NAME} from "../../../../config/services/harbor";

import {Body, Controller, Params, Post, Request, Response} from "@decorators/express";
import {ResponseExample, SwaggerTags} from "typescript-swagger";
import {ForceLoggedInMiddleware} from "../../../../config/http/middleware/auth";
import {isPermittedForResourceRealm} from "../../../../domains/auth/realm/db/utils";

enum TrainResultTask {
    RESET = 'reset'
}

type PartialTrainResult = Partial<TrainResult>;

@SwaggerTags('pht')
@Controller("/train-results")
export class TrainResultController {
    @Post("/:id/task",[ForceLoggedInMiddleware])
    @ResponseExample<PartialTrainResult>({train_id: 'xxx', status: null, image: 'xxx'})
    async edit(
        @Params('id') id: string,
        @Body() data: {
            task: TrainResultTask
        },
        @Request() req: any,
        @Response() res: any
    ): Promise<PartialTrainResult> {
        return await doTrainResultTaskRouteHandler(req, res) as PartialTrainResult;
    }
}

export async function doTrainResultTaskRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound();
    }

    await check('task')
        .exists()
        .isIn(['reset'])
        .run(req);

    const validation = validationResult(req);
    if (!validation.isEmpty()) {
        return res._failExpressValidationError(validation);
    }

    const validationData = matchedData(req, {includeOptionals: true});

    const repository = getRepository(TrainResult);

    switch (validationData.task as TrainResultTask) {
        case TrainResultTask.RESET:
            const entity = await repository.findOne(id, {relations: ["train"]});

            if (typeof entity === 'undefined') {
                return res._failNotFound();
            }

            if (!isPermittedForResourceRealm(req.realmId, entity.train.realm_id)) {
                return res._failForbidden();
            }

            await createResultServiceResultCommand('download', {
                projectName: HARBOR_OUTGOING_PROJECT_NAME,
                repositoryName: entity.train.id,
                repositoryFullName: HARBOR_OUTGOING_PROJECT_NAME + '/' + entity.train.id,

                trainId: entity.train.id,
                resultId: entity.id
            });

            entity.status = null;

            await repository.save(entity);

            return res._respondAccepted({data: entity});
    }
}
