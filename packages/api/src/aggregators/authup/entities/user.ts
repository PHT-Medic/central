/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { UserEventContext } from '@authup/common';
import { useDataSource } from 'typeorm-extension';
import { ProposalEntity, TrainEntity, UserSecretEntity } from '../../../domains';

export async function handleAuthupUserEvent(context: UserEventContext) {
    if (context.event === 'deleted') {
        const dataSource = await useDataSource();

        const proposalRepository = dataSource.getRepository(ProposalEntity);
        const proposals = await proposalRepository.find({
            where: {
                user_id: context.data.id,
            },
        });

        for (let i = 0; i < proposals.length; i++) {
            proposals[i].user_id = null;
        }

        await proposalRepository.save(proposals);

        const trainRepository = dataSource.getRepository(TrainEntity);
        const trains = await trainRepository.find({
            where: {
                user_id: context.data.id,
            },
        });

        for (let i = 0; i < trains.length; i++) {
            trains[i].user_id = null;
        }

        await trainRepository.save(trains);

        const trainFileRepository = dataSource.getRepository(TrainEntity);
        const trainFiles = await trainFileRepository.find({
            where: {
                user_id: context.data.id,
            },
        });

        await trainRepository.remove(trainFiles);

        const userSecretRepository = dataSource.getRepository(UserSecretEntity);
        const userSecrets = await userSecretRepository.find({
            where: {
                user_id: context.data.id,
            },
        });

        await userSecretRepository.remove(userSecrets);
    }
}
