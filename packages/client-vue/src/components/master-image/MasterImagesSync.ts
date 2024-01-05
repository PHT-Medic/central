/*
 * Copyright (c) 2021-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { ASearch } from '@authup/client-vue';
import type { MasterImage } from '@personalhealthtrain/core';
import {
    DomainType,
    MasterImageCommand,
} from '@personalhealthtrain/core';
import type { ListHeaderSlotProps } from '@vuecs/list-controls';
import {
    defineComponent, h, reactive, ref,
} from 'vue';
import { EntityListSlotName, injectAPIClient } from '../../core';
import EntityDelete from '../EntityDelete';
import MasterImageList from './MasterImageList';

export default defineComponent({
    components: { EntityDelete, MasterImageList },
    emits: ['failed'],
    setup(props, { emit }) {
        const apiClient = injectAPIClient();
        const meta = reactive({
            busy: false,
            created: '?',
            deleted: '?',
            updated: '?',
        });

        const itemList = ref<null | Record<string, any>>(null);

        const syncMasterImages = async () => {
            if (meta.busy) return;

            meta.busy = true;

            try {
                const { images } = await apiClient.masterImage
                    .runCommand(MasterImageCommand.SYNC);

                meta.created = images.created.length;
                meta.deleted = images.deleted.length;
                meta.updated = images.updated.length;

                if (itemList.value) {
                    await itemList.value.load();
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }

            meta.busy = false;
        };

        const handleDeleted = async (data: MasterImage) => {
            if (itemList.value) {
                itemList.value.handleDeleted(data.id);
            }
        };

        return () => h(
            'div',
            [
                h('p', [
                    'The creation of the master image project, will also register a webhook, ' +
                    'which will keep the master images between the harbor service and the UI in sync. ' +
                    'It is also possible to manually sync the master images from harbor.',
                ]),
                h('div', { class: 'mb-1' }, [
                    h('button', {
                        type: 'button',
                        disabled: meta.busy,
                        class: 'btn btn-xs btn-success',
                        onClick(event: any) {
                            event.preventDefault();

                            return syncMasterImages();
                        },
                    }, [
                        h('i', { class: 'fa fa-sync me-1' }),
                        'Sync',
                    ]),
                ]),
                h('p', { class: 'text-muted' }, [
                    'Results of the last synchronisation:',
                    h('br'),
                    'created: ',
                    h('strong', { class: 'text-success ms-1 me-1' }, [meta.created]),
                    h('br'),
                    'updated: ',
                    h('strong', { class: 'text-primary ms-1 me-1' }, [meta.updated]),
                    h('br'),
                    'deleted:',
                    h('strong', { class: 'text-danger ms-1 me-1' }, [meta.deleted]),
                ]),

                h(MasterImageList, {
                    ref: itemList,
                    scopedSlots: {
                        [EntityListSlotName.HEADER]: (props: ListHeaderSlotProps<MasterImage>) => [
                            h(ASearch, {
                                load: props.load,
                                meta: props.meta,
                                busy: props.busy,
                            }),
                            h('strong', ['Overview']),
                        ],
                        [EntityListSlotName.ITEM_ACTIONS]: (props : { data: MasterImage }) => h(EntityDelete, {
                            class: 'btn btn-xs btn-danger',
                            elementType: 'button',
                            entityId: props.data.id,
                            entityType: DomainType.MASTER_IMAGE,
                            withText: false,
                            onDeleted(item: MasterImage) {
                                return handleDeleted(item);
                            },
                        }),
                    },
                }),
            ],
        );
    },
});
