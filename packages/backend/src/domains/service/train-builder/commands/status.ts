import {Train} from "@personalhealthtrain/ui-common";

export async function buildTrainBuilderStatusCommandPayload(train: Train) {
    return {
        trainId: train.id
    }
}
