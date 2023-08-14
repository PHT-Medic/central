/*
 * Copyright (c) 2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { RobotEventContext } from '@authup/core';
import { Ecosystem, ServiceID } from '@personalhealthtrain/core';
import { publish } from 'amqp-extension';
import { useDataSource } from 'typeorm-extension';
import { RegistryCommand } from '../../../components';
import { buildRegistryPayload } from '../../../components/registry/utils/queue';
import { RegistryProjectEntity } from '../../../domains';

export async function handleAuthupRobotEvent(context: RobotEventContext) {
    if (context.event === 'created' || context.event === 'updated') {
        if (context.data.name === ServiceID.REGISTRY) {
            const dataSource = await useDataSource();

            const projectRepository = dataSource.getRepository(RegistryProjectEntity);
            const projects = await projectRepository.find({
                select: ['id'],
                where: {
                    ecosystem: Ecosystem.DEFAULT,
                },
            });

            for (let i = 0; i < projects.length; i++) {
                const queueMessage = buildRegistryPayload({
                    command: RegistryCommand.PROJECT_LINK,
                    data: {
                        id: projects[i].id,
                    },
                });

                await publish(queueMessage);
            }
        }
    }
}
