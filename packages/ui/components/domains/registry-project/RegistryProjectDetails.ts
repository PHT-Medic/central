/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';
import type {
    RegistryProject,
    SocketClientToServerEvents,
    SocketServerToClientEventContext,
    SocketServerToClientEvents,
} from '@personalhealthtrain/central-common';
import {
    RegistryAPICommand,
    RegistryProjectSocketClientToServerEventName,
    RegistryProjectSocketServerToClientEventName,
    ServiceID,
} from '@personalhealthtrain/central-common';
import type { Socket } from 'socket.io-client';

type Properties = {
    entityId: RegistryProject['id']
};

type Data = {
    entity: null | RegistryProject,
    busy: boolean
};

export default Vue.extend<Data, any, any, Properties>({
    name: 'RegistryProjectDetails',
    props: {
        entityId: String as PropType<RegistryProject['id']>,
    },
    data() {
        return {
            busy: false,
            entity: null,
        };
    },
    computed: {
        name() {
            return this.entity ?
                this.entity.external_name :
                undefined;
        },
        accountId() {
            return this.entity ?
                this.entity.account_id :
                undefined;
        },
        accountName() {
            return this.entity ?
                this.entity.account_name :
                undefined;
        },
        accountSecret() {
            return this.entity ?
                this.entity.account_secret :
                undefined;
        },
        webhookExists() {
            return this.entity ?
                this.entity.webhook_exists :
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
            .then(this.resolve);
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace();

        socket.emit(RegistryProjectSocketClientToServerEventName.SUBSCRIBE, { data: { id: this.entityId } });
        socket.on(RegistryProjectSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace();

        socket.emit(RegistryProjectSocketClientToServerEventName.UNSUBSCRIBE, { data: { id: this.entityId } });
        socket.off(RegistryProjectSocketServerToClientEventName.UPDATED, this.handleSocketUpdated);
    },
    methods: {
        async resolve() {
            if (this.busy) return;

            this.busy = true;

            try {
                this.entity = await this.$api.registryProject.getOne(this.entityId, {
                    fields: [
                        '+account_id',
                        '+account_name',
                        '+account_secret',
                    ],
                });

                this.$emit('resolved', this.entity);
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },

        handleSocketUpdated(context: SocketServerToClientEventContext<RegistryProject>) {
            if (
                context.data.id !== this.entityId
            ) return;

            this.handleUpdated(context.data);
        },

        handleUpdated(item: RegistryProject) {
            const keys = Object.keys(item) as (keyof RegistryProject)[];
            for (let i = 0; i < keys.length; i++) {
                Vue.set(this.entity, keys[i], item[keys[i]]);
            }

            Promise.resolve()
                .then(this.resolve)
                .then(() => this.$emit('updated', this.entity));
        },

        async linkProject() {
            await this.run(RegistryAPICommand.PROJECT_LINK);
        },
        async unlinkProject() {
            await this.run(RegistryAPICommand.PROJECT_UNLINK);
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

        if (!vm.entity) {
            return h(
                'div',
                { staticClass: 'alert alert-sm alert-warning' },
                [
                    'The registry-project details can not be displayed.',
                ],
            );
        }

        return h('div', [
            h('div', {
                staticClass: 'mb-2 d-flex flex-column',
            }, [
                h('div', { staticClass: 'form-group' }, [
                    h('label', { staticClass: 'pr-1' }, 'Namespace'),
                    h('input', {
                        staticClass: 'form-control',
                        attrs: { type: 'text', value: vm.name, disabled: true },
                    }),
                ]),

                h('div', [
                    h('div', { staticClass: 'form-group' }, [
                        h('label', { staticClass: 'pr-1' }, 'ID'),
                        h('input', {
                            staticClass: 'form-control',
                            attrs: { type: 'text', value: vm.accountName || 'xxx', disabled: true },
                        }),
                    ]),
                    h('div', { staticClass: 'form-group' }, [
                        h('label', { staticClass: 'pr-1' }, 'Secret'),
                        h('input', {
                            staticClass: 'form-control',
                            attrs: { type: 'text', value: vm.accountSecret || 'xxx', disabled: true },
                        }),
                    ]),
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
            ]),
            h('hr'),
            h('div', { staticClass: 'row' }, [
                h('div', { staticClass: 'col' }, [
                    h('div', {
                        staticClass: 'alert alert-sm alert-info',
                    }, [
                        'The link trigger will spin up the remote registry representation.',
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

                                    vm.linkProject.call(null);
                                },
                            },
                        }, [
                            h('i', { staticClass: 'fa-solid fa-link pr-1' }),
                            'Link',
                        ]),
                    ]),
                ]),
                h('div', { staticClass: 'col' }, [
                    h('div', {
                        staticClass: 'alert alert-sm alert-warning',
                    }, [
                        'The unlink trigger will remove the remote registry representation.',
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

                                    vm.unlinkProject.call(null);
                                },
                            },
                        }, [
                            h('i', { staticClass: 'fa-solid fa-link-slash pr-1' }),
                            'Unlink',
                        ]),
                    ]),
                ]),
            ]),
        ]);
    },
});
