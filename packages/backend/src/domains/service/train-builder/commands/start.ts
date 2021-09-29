import {getRepository} from "typeorm";
import {UserKeyRing} from "@personalhealthtrain/ui-common";
import {MasterImage, Train, TrainFile, TrainStation, TrainStationApprovalStatus} from "@personalhealthtrain/ui-common";

export async function buildTrainBuilderStartCommandPayload(train: Train) {
    const masterImageRepository = getRepository(MasterImage);
    const masterImage = await masterImageRepository.findOne(train.master_image_id);

    // todo: check existence

    const keyRingRepository = getRepository(UserKeyRing);
    const keyRing = await keyRingRepository.findOne({
        user_id: train.user_id
    });

    // todo: check existence

    const filesRepository = getRepository(TrainFile);
    const files: TrainFile[] = await filesRepository
        .createQueryBuilder('file')
        .where('file.train_id = :id', {id: train.id})
        .getMany();

    const entryPointFile = await filesRepository.findOne(train.entrypoint_file_id);
    // todo: check existence

    const trainStationRepository = getRepository(TrainStation);
    const trainStations = await trainStationRepository
        .createQueryBuilder('trainStation')
        .leftJoinAndSelect('trainStation.station', 'station')
        .addSelect('station.secure_id')
        .where("trainStation.train_id = :trainId", {trainId: train.id})
        .andWhere("trainStation.approval_status = :status", {status: TrainStationApprovalStatus.APPROVED})
        .getMany();

    return {
        userId: train.user_id,
        trainId: train.id,
        buildId: train.build_id,
        proposalId: train.proposal_id,
        stations: trainStations.map(trainStation => trainStation.station.secure_id),
        files: files.map((file: TrainFile) => file.directory + '/' + file.name),
        masterImage: masterImage.path,
        entrypointExecutable: train.entrypoint_executable,
        entrypointPath: entryPointFile.directory + '/' + entryPointFile.name,
        sessionId: train.session_id,
        hash: train.hash,
        hashSigned: train.hash_signed,
        query: train.query,
        user_he_key: !!keyRing ? keyRing.he_key : null
    }
}
