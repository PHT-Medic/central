import {QueueMessage} from "../../modules/message-queue";
import {dropHarborImage, saveAndExtractHarborImage} from "../../modules/pht/result/image";

export async function extractImage(message: QueueMessage) {
    await saveAndExtractHarborImage(message.data.resultId, message.data.repositoryFullName);
    await dropHarborImage(message.data.repositoryFullName);

    return message;
}
