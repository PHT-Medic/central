/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, h } from 'vue';
import type { TrainStation } from '@personalhealthtrain/core';
import {
    DomainType,
} from '@personalhealthtrain/core';
import { createEntityManager, defineEntityManagerEvents } from '../../core';

export default defineComponent({
    props: {
        trainId: {
            type: String,
            required: true,
        },
        stationId: {
            type: String,
            required: true,
        },
        realmId: String,
    },
    emits: defineEntityManagerEvents<TrainStation>(),
    async setup(props, setup) {
        const manager = createEntityManager({
            type: `${DomainType.TRAIN_STATION}`,
            setup,
            socket: {
                processEvent(event) {
                    return event.data.train_id === props.trainId &&
                        event.data.station_id === props.stationId;
                },
            },
        });

        await manager.resolve({
            query: {
                filters: {
                    train_id: props.trainId,
                    station_id: props.stationId,
                },
            },
        });

        return () => h('button', {
            class: ['btn btn-xs', {
                'btn-success': !manager.data.value,
                'btn-danger': manager.data.value,
            }],
            onClick($event: any) {
                $event.preventDefault();

                if (manager.data.value) {
                    return manager.delete();
                }

                return manager.create({
                    train_id: props.trainId,
                    station_id: props.stationId,
                });
            },
        }, [
            h('i', {
                class: ['fa', {
                    'fa-plus': !manager.data.value,
                    'fa-trash': manager.data.value,
                }],
            }),
        ]);
    },
});
