/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useToast } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import { defineComponent } from 'vue';
import type { Registry } from '@personalhealthtrain/central-common';
import { RegistryAPICommand } from '@personalhealthtrain/central-common';
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
    setup(props) {
        const toast = useToast();

        const busy = ref(false);

        const setup = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                await useAPI().service.runRegistryCommand(RegistryAPICommand.SETUP, {
                    id: props.entityId,
                });

                if (toast) {
                    toast.success({ body: 'You successfully executed the setup routine.' }, {
                        pos: 'top-center',
                    });
                }
            } catch (e) {
                if (toast && e instanceof Error) {
                    toast.danger({ body: e.message }, {
                        pos: 'top-center',
                    });
                }
            }

            busy.value = false;
        };

        return () => h('div', [
            h('h6', [
                h('i', { class: 'fa fa-sign-in-alt mr-1' }),
                'Incoming',
            ]),
            h('p', { class: 'mb-1' }, [
                'The incoming project is required for the',
                h('i', { class: 'pl-1 pr-1' }, ['TrainBuilder']),
                'to work properly. When the TrainBuilder ' +
                'is finished with building the train, the train will be pushed to the incoming project. ' +
                'From there the TrainRouter can move it to the first station project of the route.',
            ]),

            h('hr'),

            h('h6', [
                h('i', { class: 'fa fa-sign-out-alt mr-1' }),
                'Outgoing',
            ]),
            h('p', { class: 'mb-1' }, [
                'The outgoing project is required for the',
                h('i', { class: 'pl-1 pr-1' }, 'ResultService'),
                'to pull the train from the',
                'outgoing project and extract the results of the journey.',
            ]),

            h('hr'),

            h('h6', [
                h('i', { class: 'fa fa-info mr-1' }),
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
                h('i', { class: 'fa fa-cogs mr-1' }),
                'Setup',
            ]),
        ]);
    },
});
