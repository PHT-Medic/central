/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useToast } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import { defineComponent, h, ref } from 'vue';
import type { Registry } from '@personalhealthtrain/central-common';
import { RegistryAPICommand } from '@personalhealthtrain/central-common';
import { useAPI } from '../../../composables/api';
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

        const execute = async () => {
            if (busy.value) return;

            busy.value = true;

            try {
                await useAPI().service.runRegistryCommand(RegistryAPICommand.CLEANUP, {
                    id: props.entityId,
                });

                if (toast) {
                    toast.success({ body: 'You successfully executed the cleanup routine.' }, {
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
            h('p', { class: 'mb-1' }, [
                'This command will remove any registry project which is not present in the current instance.',
            ]),

            h('button', {
                type: 'button',
                disabled: busy.value,
                class: 'btn btn-xs btn-dark',
                onClick(event: any) {
                    event.preventDefault();

                    return execute();
                },
            }, [
                'Execute',
            ]),
        ]);
    },
});
