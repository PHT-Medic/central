import {QueueMessage} from "../../modules/message-queue";
import {downloadHarborRepositoryImages} from "../../modules/pht/result/image";

export async function downloadImage(message: QueueMessage) {
    await downloadHarborRepositoryImages(message.data.repositoryFullName);

    return message;
}
