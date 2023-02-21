/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';
import type { Registry } from '@personalhealthtrain/central-common';
import { RegistryAPICommand } from '@personalhealthtrain/central-common';
import EntityDelete from '../EntityDelete';
import { MasterImageList } from '../master-image/MasterImageList';

export default Vue.extend({
    components: { EntityDelete, MasterImageList },
    props: {
        entityId: String as PropType<Registry['id']>,
    },
    data() {
        return {
            busy: false,
        };
    },
    methods: {
        async setup() {
            if (this.busy) return;

            this.busy = true;

            try {
                await this.$api.service.runRegistryCommand(RegistryAPICommand.SETUP, {
                    id: this.entityId,
                });

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
    },
    render(h: CreateElement): VNode {
        const vm = this;

        return h('div', [
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
        ]);
    },
});
