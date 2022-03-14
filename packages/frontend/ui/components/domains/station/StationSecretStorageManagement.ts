/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, PropType, VNode } from 'vue';
import {
    SecretStorageCommand,
    Station,
    buildStationSecretStorageKey,
} from '@personalhealthtrain/central-common';

export default Vue.extend({
    name: 'StationSecretStorageManagement',
    props: {
        entity: Object as PropType<Station>,
    },
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        pathName() {
            return buildStationSecretStorageKey(this.entity.secure_id);
        },
        isEditing() {
            return this.entity &&
                Object.prototype.hasOwnProperty.call(this.entity, 'id');
        },
    },
    methods: {
        async saveEngineKey() {
            await this.run(SecretStorageCommand.ENGINE_KEY_SAVE);
        },
        async deleteEngineKey() {
            await this.run(SecretStorageCommand.ENGINE_KEY_DROP);
        },
        async run(action) {
            if (this.busy || !this.isEditing) return;

            this.busy = true;

            try {
                const station = await this.$api.service.runSecretStorageCommand(action, {
                    name: buildStationSecretStorageKey(this.entity.id),
                });

                this.$emit('updated', station);
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        return h('div', [
            h('h6', [
                h('i', { staticClass: 'fa fa-key pr-1' }),
                'Secret Storage',
            ]),
            h('p', { staticClass: 'mb-2' }, [
                'To keep the data between the secret key storage engine and the ui in sync, you can',
                ' ',
                'either pull existing secrets from the storage engine or push local secrets against it.',
            ]),
            h('p', [
                h('strong', { staticClass: 'pr-1' }, 'Path:'),
                vm.pathName,
            ]),
            h('div', { staticClass: 'd-flex flex-row' }, [
                h('div', [
                    h('button', {
                        class: 'btn btn-xs btn-primary',
                        attrs: {
                            disabled: vm.busy,
                            type: 'button',
                        },
                        on: {
                            click($event) {
                                $event.preventDefault();

                                vm.saveEngineKey.call(null);
                            },
                        },
                    }, [
                        h('i', { staticClass: 'fa fa-save pr-1' }),
                        'Save',
                    ]),
                ]),
                h('div', { staticClass: 'ml-auto' }, [
                    h('button', {
                        class: 'btn btn-xs btn-danger',
                        attrs: {
                            disabled: vm.busy,
                            type: 'button',
                        },
                        on: {
                            click($event) {
                                $event.preventDefault();

                                vm.deleteEngineKey.call(null);
                            },
                        },
                    }, [
                        h('i', { staticClass: 'fa fa-trash pr-1' }),
                        'Delete',
                    ]),
                ]),
            ]),
        ]);
    },
});
