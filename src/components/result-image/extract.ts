import {QueueMessage} from "../../modules/message-queue";
import {saveTrainImageResult} from "../../modules/pht/result/image";

export async function extractImage(message: QueueMessage) {
    await saveTrainImageResult(message.data.resultId, message.data.resultImage);

    return message;
}
