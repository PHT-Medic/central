/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent, h, ref } from 'vue';
import type { Registry } from '@personalhealthtrain/core';
import { RegistryAPICommand } from '@personalhealthtrain/core';
import { injectAPIClient } from '../../core';
import EntityDelete from '../EntityDelete';
import MasterImageList from '../master-image/MasterImageList';

export default defineComponent({
    components: { EntityDelete, MasterImageList },
    props: {
        entityId: {
            type: String as PropType<Registry['id']>,
            required: true,
        },
    },
    emits: ['executed', 'failed'],
    setup(props, { emit }) {
        const apiClient = injectAPIClient();
        const busy = ref(false);

        const setup = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                await apiClient.service.runRegistryCommand(RegistryAPICommand.SETUP, {
                    id: props.entityId,
                });

                emit('executed');
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            busy.value = false;
        };

        return () => h('div', [
            h('h6', [
                h('i', { class: 'fa fa-sign-in-alt me-1' }),
                'Incoming',
            ]),
            h('p', { class: 'mb-1' }, [
                'The incoming project is required for the',
                h('i', { class: 'ps-1 pe-1' }, ['TrainBuilder']),
                'to work properly. When the TrainBuilder ' +
                'is finished with building the train, the train will be pushed to the incoming project. ' +
                'From there the TrainRouter can move it to the first station project of the route.',
            ]),

            h('hr'),

            h('h6', [
                h('i', { class: 'fa fa-sign-out-alt me-1' }),
                'Outgoing',
            ]),
            h('p', { class: 'mb-1' }, [
                'The outgoing project is required for the',
                h('i', { class: 'ps-1 pe-1' }, 'ResultService'),
                'to pull the train from the',
                'outgoing project and extract the results of the journey.',
            ]),

            h('hr'),

            h('h6', [
                h('i', { class: 'fa fa-info me-1' }),
                'Info',
            ]),
            h('p', [
                'To setup or ensure the existence of all projects (incoming, outgoing, ...) and ',
                'the corresponding webhooks run the setup routine.',
            ]),

            h('button', {
                type: 'button',
                disabled: busy.value,
                class: 'btn btn-xs btn-dark',
                onClick(event: any) {
                    event.preventDefault();

                    return setup();
                },
            }, [
                'Execute',
            ]),
        ]);
    },
});
