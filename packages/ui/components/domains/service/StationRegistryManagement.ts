/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { ServiceID } from '@personalhealthtrain/central-common';
import {
    REGISTRY_INCOMING_PROJECT_NAME,
    REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME, StationRegistryCommand,
} from '@personalhealthtrain/central-common';
import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';
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
        async sync() {
            if (this.busy) return;

            this.busy = true;

            try {
                await this.$api.service.runCommand(this.entityId, StationRegistryCommand.SYNC);

                this.$bvToast.toast('You successfully executed the sync routine.', {
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
    },
    render(h: CreateElement): VNode {
        const vm = this;

        return h('div', [
            h('h6', [
                h('i', { staticClass: 'fa-solid fa-rotate mr-1' }),
                'Synchronization',
            ]),
            h('p', { staticClass: 'mb-1' }, [
                'This operation will synchronize realms & stations from the station-registry and',
                ' ',
                'register the corresponding public keys in the secret-storage.',
            ]),
            h('hr'),
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

                        vm.sync.call(null);
                    },
                },
            }, [
                h('i', { staticClass: 'fa-solid fa-rotate mr-1' }),
                'Sync',
            ]),
        ]);
    },
});
