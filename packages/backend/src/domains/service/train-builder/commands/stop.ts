import {Train} from "@personalhealthtrain/ui-common";

export async function buildTrainBuilderStopCommandPayload(train: Train) {
    return {
        trainId: train.id
    }
}
