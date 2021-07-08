import {QueueMessage} from "../../modules/message-queue";
import {downloadHarborRepositoryImages} from "../../domains/train/result/image";

export async function downloadImage(message: QueueMessage) {
    await downloadHarborRepositoryImages(message.data.repositoryFullName);

    return message;
}
