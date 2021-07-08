import {getRepository} from "typeorm";
import {Train} from "../../../../../domains/pht/train";
import tar from "tar-stream";
import path from "path";
import {getWritableDirPath} from "../../../../../config/paths";
import {TrainFile} from "../../../../../domains/pht/train/file";
import fs from "fs";
import {TrainStation} from "../../../../../domains/pht/train/station";
import {isRealmPermittedForResource} from "../../../../../domains/auth/realm/db/utils";

export async function getTrainFileStreamRouteHandler(req: any, res: any) {
    const {id} = req.params;

    if (typeof id !== 'string') {
        return res._failNotFound({message: 'The given train id is not valid...'});
    }

    const repository = getRepository(Train);

    const train = await repository.findOne(id);

    if (typeof train === 'undefined') {
        return res._failNotFound({message: 'The requested train was not found...'});
    }

    if(!isRealmPermittedForResource(req.user, train)) {
        const proposalStations = await getRepository(TrainStation).find({
            where: {
                train_id: train.id
            },
            relations: ['station']
        });

        let isPermitted = false;

        for(let i=0; i<proposalStations.length; i++) {
            if(isRealmPermittedForResource(req.user, proposalStations[i].station)) {
                isPermitted = true;
                break;
            }
        }

        if(!isPermitted) {
            return res._failForbidden({message: 'You are not allowed to inspect the train files.'});
        }
    }

    res.writeHead(200, {
        'Content-Type': 'application/x-tar',
        'Transfer-Encoding': 'chunked'
    });

    const pack = tar.pack();
    pack.pipe(res);

    pack.on('close', () => {
        res.end();
    });

    const trainDirectoryPath = path.resolve(getWritableDirPath() + '/train-files');

    const files = await getRepository(TrainFile).find({
        train_id: train.id
    });

    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const buffer: Buffer = fs.readFileSync(trainDirectoryPath + '/' + files[i].hash + '.file');

            await new Promise((resolve: (data?: any) => void, reject) => {
                pack.entry({name: files[i].directory + '/' + files[i].name, size: files[i].size}, buffer, (err) => {
                    if (err) reject();

                    resolve();
                });
            });
        }

        pack.finalize();
    } else {
        pack.finalize();
    }
}
