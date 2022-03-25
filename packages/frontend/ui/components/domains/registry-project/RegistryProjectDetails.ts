/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, PropType, VNode } from 'vue';
import { RegistryCommand, RegistryProject, ServiceID } from '@personalhealthtrain/central-common';

// todo: add data, prop, method typing
type Properties = {
    entityId: RegistryProject['id'],
    entity?: RegistryProject
};

type Data = {
    item: null | RegistryProject,
    busy: boolean
};

export default Vue.extend<Data, any, any, Properties>({
    name: 'RegistryProjectDetails',
    props: {
        entityId: String as PropType<RegistryProject['id']>,
        entity: {
            type: Object as PropType<RegistryProject>,
            default: undefined,
        },
    },
    data() {
        return {
            busy: false,
            item: null,
        };
    },
    computed: {
        name() {
            return this.item ?
                this.item.external_name :
                undefined;
        },
        accountId() {
            return this.item ?
                this.item.account_id :
                undefined;
        },
        accountName() {
            return this.item ?
                this.item.account_name :
                undefined;
        },
        accountSecret() {
            return this.item ?
                this.item.account_secret :
                undefined;
        },
        webhookExists() {
            return this.item ?
                this.item.webhook_exists :
                undefined;
        },
        updatedAt() {
            return this.entity ?
                this.entity.updated_at :
                undefined;
        },
    },
    created() {
        Promise.resolve()
            .then(this.initFromProperties)
            .then(this.resolve);
    },
    methods: {
        async initFromProperties() {
            if (!this.entity) return;

            this.item = this.entity;
        },
        async resolve() {
            if (this.entity) return;

            try {
                // todo: add account_*** fields to query
                this.item = await this.$api.registryProject.getOne(this.entityId);

                this.$emit('resolved', this.item);
            } catch (e) {
                // ....
            }
        },
        async setupProject() {
            await this.run(RegistryCommand.PROJECT_SETUP);
        },
        async deleteProject() {
            await this.run(RegistryCommand.PROJECT_DELETE);
        },
        async run(command) {
            if (this.busy) return;

            this.busy = true;

            try {
                await this.$api.service.runCommand(ServiceID.REGISTRY, command, {
                    id: this.entity.id,
                });

                this.$emit('updated');
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

        const robotCredentials = [];

        if (vm.accountName) {
            robotCredentials.push(h('div', [
                vm.accountName,
            ]));
        }

        if (vm.accountSecret) {
            robotCredentials.push(h('div', [
                vm.accountSecret,
            ]));
        }

        return h('div', [
            h('div', {
                staticClass: 'mb-2 d-flex flex-column',
            }, [
                h('div', [
                    h('strong', { staticClass: 'pr-1' }, 'Namespace:'),
                    vm.name,
                ]),

                h('div', [
                    h('strong', { staticClass: 'pr-1' }, 'Webhook:'),
                    h('i', {
                        class: {
                            'fa fa-check text-success': vm.webhookExists,
                            'fa fa-times text-danger': !vm.webhookExists,
                        },
                    }),
                ]),

                h('div', [
                    h('strong', { staticClass: 'pr-1' }, 'Robot:'),
                    h('i', {
                        class: {
                            'fa fa-check text-success': vm.accountId,
                            'fa fa-times text-danger': !vm.accountId,
                        },
                    }),
                    h('div', { staticClass: 'd-flex flex-column' }, [
                        robotCredentials,
                    ]),
                ]),
            ]),
            h('hr'),
            h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col' }, [
                    h('div', {
                        staticClass: 'alert alert-sm alert-info',
                    }, [
                        'The setup trigger will spin up the remote registry representation.',
                    ]),
                    h('div', { staticClass: 'text-center' }, [
                        h('button', {
                            class: 'btn btn-xs btn-primary',
                            attrs: {
                                disabled: vm.busy,
                                type: 'button',
                            },
                            on: {
                                click($event) {
                                    $event.preventDefault();

                                    vm.setupProject.call(null);
                                },
                            },
                        }, [
                            h('i', { staticClass: 'fa fa-save pr-1' }),
                            'Setup',
                        ]),
                    ]),
                ]),
                h('div', { staticClass: 'col' }, [
                    h('div', {
                        staticClass: 'alert alert-sm alert-warning',
                    }, [
                        'The delete trigger will remove the remote registry representation.',
                    ]),
                    h('div', { staticClass: 'text-center' }, [
                        h('button', {
                            class: 'btn btn-xs btn-danger',
                            attrs: {
                                disabled: vm.busy,
                                type: 'button',
                            },
                            on: {
                                click($event) {
                                    $event.preventDefault();

                                    vm.deleteProject.call(null);
                                },
                            },
                        }, [
                            h('i', { staticClass: 'fa fa-trash pr-1' }),
                            'Delete',
                        ]),
                    ]),
                ]),
            ]),
        ]);
    },
});
