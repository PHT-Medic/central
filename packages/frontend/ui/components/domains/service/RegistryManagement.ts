/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    MasterImageCommand,
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME,
    RegistryCommand,
    ServiceID,
} from '@personalhealthtrain/central-common';
import Vue, { CreateElement, PropType, VNode } from 'vue';
import { SlotName } from '@vue-layout/utils';
import EntityDelete from '../EntityDelete';
import { MasterImageList } from '../master-image/MasterImageList';

export default Vue.extend({
    components: { EntityDelete, MasterImageList },
    props: {
        entityId: String as PropType<ServiceID>,
    },
    data() {
        return {
            busy: false,
            masterImagesMeta: {
                busy: false,
                created: '?',
                deleted: '?',
                updated: '?',
            },
            projectKey: {
                INCOMING: REGISTRY_INCOMING_PROJECT_NAME,
                OUTGOING: REGISTRY_OUTGOING_PROJECT_NAME,
                MASTER_IMAGE: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            },
        };
    },
    methods: {
        async setup() {
            if (this.busy) return;

            this.busy = true;

            try {
                await this.$api.service.runCommand(this.entityId, RegistryCommand.SETUP);

                this.$bvToast.toast('You successfully executed the setup routine.', {
                    toaster: 'b-toaster-top-center',
                });
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    toaster: 'b-toaster-top-center',
                    variant: 'danger',
                });
            }

            this.busy = false;
        },
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
                h('h4', [
                    h('i', { staticClass: 'fa fa-archive mr-1' }),
                    'Projects',
                ]),
                h(
                    'div',
                    { staticClass: 'row' },
                    [
                        h('div', { staticClass: 'col' }, [
                            h('h6', [
                                h('i', { staticClass: 'fa fa-sign-in-alt mr-1' }),
                                'Incoming',
                            ]),
                            h('p', { staticClass: 'mb-1' }, [
                                'The incoming project is required for the',
                                h('i', { staticClass: 'pl-1 pr-1' }, ['TrainBuilder']),
                                'to work properly. When the TrainBuilder ' +
                                'is finished with building the train, the train will be pushed to the incoming project. ' +
                                'From there the TrainRouter can move it to the first station project of the route.',
                            ]),

                            h('hr'),

                            h('h6', [
                                h('i', { staticClass: 'fa fa-sign-out-alt mr-1' }),
                                'Outgoing',
                            ]),
                            h('p', { staticClass: 'mb-1' }, [
                                'The outgoing project is required for the',
                                h('i', { staticClass: 'pl-1 pr-1' }, 'ResultService'),
                                'to pull the train from the',
                                'outgoing project and extract the results of the journey.',
                            ]),

                            h('hr'),

                            h('h6', [
                                h('i', { staticClass: 'fa fa-info mr-1' }),
                                'Info',
                            ]),
                            h('p', [
                                'To setup or ensure the existence of all projects (incoming, outgoing, ...) and ',
                                'the corresponding webhooks run the setup routine.',
                            ]),

                            h('button', {
                                domProps: {
                                    disabled: vm.busy,
                                },
                                attrs: {
                                    type: 'button',
                                    disabled: vm.busy,
                                },
                                staticClass: 'btn btn-xs btn-dark',
                                on: {
                                    click(event) {
                                        event.preventDefault();

                                        vm.setup.call(null);
                                    },
                                },
                            }, [
                                h('i', { staticClass: 'fa fa-cogs mr-1' }),
                                'Setup',
                            ]),
                        ]),
                        h('div', { staticClass: 'col' }, [
                            h('h6', [
                                h('i', { staticClass: 'fas fa-sd-card mr-1' }),
                                'Master Images',
                            ]),
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
                        ]),
                    ],
                ),
            ],
        );
    },
});
