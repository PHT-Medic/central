import {Message} from "amqp-extension";
import {dropHarborImage, saveAndExtractHarborImage} from "../../domains/train-result/image";

export async function extractImage(message: Message) {
    await saveAndExtractHarborImage(message.data.resultId, message.data.repositoryFullName);
    await dropHarborImage(message.data.repositoryFullName);

    return message;
}
