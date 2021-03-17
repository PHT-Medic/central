import {QueueMessage} from "../../modules/message-queue";
import {downloadTrainImage} from "../../modules/pht/result/image";

export async function downloadImage(message: QueueMessage) {
    await downloadTrainImage(message.data.resultImage);

    return message;
}
