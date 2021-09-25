import {Train} from "../../../pht/train";

export async function buildTrainBuilderStatusCommandPayload(train: Train) {
    return {
        trainId: train.id
    }
}
