/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MasterImageCommand,
} from '@personalhealthtrain/central-common';
import Vue, { CreateElement, VNode } from 'vue';
import { SlotName } from '@vue-layout/utils';
import EntityDelete from '../EntityDelete';
import { MasterImageList } from './MasterImageList';

export default Vue.extend({
    components: { EntityDelete, MasterImageList },
    data() {
        return {
            busy: false,
            masterImagesMeta: {
                busy: false,
                created: '?',
                deleted: '?',
                updated: '?',
            },
        };
    },
    methods: {
        async syncMasterImages() {
            if (this.masterImagesMeta.busy) return;

            this.masterImagesMeta.busy = true;

            try {
                const { images } = await this.$api.masterImage
                    .runCommand(MasterImageCommand.SYNC_GIT_REPOSITORY);

                this.masterImagesMeta.created = images.created.length;
                this.masterImagesMeta.deleted = images.deleted.length;
                this.masterImagesMeta.updated = images.updated.length;

                await this.$refs.itemList.load();
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.masterImagesMeta.busy = false;
        },
        async handleDeleted(id) {
            this.$refs.itemList.handleDeleted(id);
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        return h(
            'div',
            [
                h('p', [
                    'The creation of the master image project, will also register a webhook, ' +
                    'which will keep the master images between the harbor service and the UI in sync. ' +
                    'It is also possible to manually sync the master images from harbor.',
                ]),
                h('div', { staticClass: 'mb-1' }, [
                    h('button', {
                        domProps: {
                            disabled: vm.masterImagesMeta.busy,
                        },
                        attrs: {
                            type: 'button',
                            disabled: vm.masterImagesMeta.busy,
                        },
                        staticClass: 'btn btn-xs btn-success',
                        on: {
                            click(event) {
                                event.preventDefault();

                                vm.syncMasterImages.call(null);
                            },
                        },
                    }, [
                        h('i', { staticClass: 'fa fa-sync mr-1' }),
                        'Sync',
                    ]),
                ]),
                h('p', { staticClass: 'text-muted' }, [
                    'The last synchronisation created',
                    h('strong', { staticClass: 'text-success ml-1 mr-1' }, [vm.masterImagesMeta.created]),
                    'updated',
                    h('strong', { staticClass: 'text-primary ml-1 mr-1' }, [vm.masterImagesMeta.updated]),
                    'deleted',
                    h('strong', { staticClass: 'text-danger ml-1 mr-1' }, [vm.masterImagesMeta.deleted]),
                    'master image(s).',
                ]),

                h(MasterImageList, {
                    ref: 'itemList',
                    scopedSlots: {
                        [SlotName.HEADER_TITLE]: () => h('strong', ['Overview']),
                        [SlotName.ITEM_ACTIONS]: (props) => h(EntityDelete, {
                            staticClass: 'btn btn-xs btn-danger',
                            props: {
                                elementType: 'button',
                                entityId: props.item.id,
                                entityType: 'masterImage',
                                withText: false,
                            },
                            on: {
                                deleted(item) {
                                    vm.handleDeleted.call(null, item);
                                },
                            },
                        }),
                    },
                }),
            ],
        );
    },
});
