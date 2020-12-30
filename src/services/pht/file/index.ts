import {TrainFile} from "../../../domains/pht/train/file";
import path from "path";
import {getWritableDirPath} from "../../../config/paths";

export function getTrainFileFilePath(file: TrainFile) {
    return getTrainFileDirectoryPath(file) + '/' + getTrainFileFileName(file);
}

export function getTrainFileFileName(file: TrainFile) {
    return file.hash + '.file';
}

export function getTrainFileDirectoryPath(file: TrainFile) {
    return path.resolve(getWritableDirPath() + '/train-files');
}
