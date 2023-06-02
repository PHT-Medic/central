/*
 * Copyright (c) 2022-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { DomainEventName } from '@authup/core';
import type {
    RegistryProject,
    RegistryProjectEventContext,
    SocketServerToClientEventContext,
} from '@personalhealthtrain/central-common';
import {
    DomainEventSubscriptionName,
    DomainType,
    RegistryAPICommand,
    ServiceID,
    buildDomainEventFullName,
    buildDomainEventSubscriptionFullName,
} from '@personalhealthtrain/central-common';
import { merge } from 'smob';
import type { PropType } from 'vue';
import { computed } from 'vue';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { useSocket } from '../../../composables/socket';
import { wrapFnWithBusyState } from '../../../core/busy';

export default defineComponent({
    name: 'RegistryProjectDetails',
    props: {
        entityId: {
            type: String as PropType<RegistryProject['id']>,
            required: true,
        },
    },
    emits: ['resolved', 'failed', 'updated'],
    async setup(props, { emit }) {
        const refs = toRefs(props);

        const busy = ref(false);
        const entity = ref<null | RegistryProject>(null);

        const name = computed(() => {
            if (!entity.value) {
                return '';
            }

            return entity.value.external_name;
        });

        const accountName = computed(() => {
            if (!entity.value) {
                return '';
            }

            return entity.value.account_name;
        });

        const accountSecret = computed(() => {
            if (!entity.value) {
                return '';
            }

            return entity.value.account_secret;
        });

        const webhookExists = computed(() => {
            if (!entity.value) {
                return false;
            }

            return !!entity.value.webhook_exists;
        });

        const resolve = wrapFnWithBusyState(busy, async () => {
            try {
                entity.value = await useAPI().registryProject.getOne(refs.entityId.value, {
                    fields: [
                        '+account_id',
                        '+account_name',
                        '+account_secret',
                    ],
                });

                emit('resolved', entity.value);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        await resolve();

        const handleUpdated = (item: RegistryProject) => {
            if (entity.value) {
                entity.value = merge({}, item, entity.value);
            }

            entity.value = item;

            // todo: we might need to resolve here to load account_secret

            emit('updated', entity.value);
        };

        const handleSocketUpdated = (context: SocketServerToClientEventContext<RegistryProjectEventContext>) => {
            if (
                context.data.id !== refs.entityId.value
            ) return;

            handleUpdated(context.data);
        };

        const socketRealmId = realmIdForSocket(entity.value ? entity.value.realm_id : undefined);
        const socket = useSocket().useRealmWorkspace(socketRealmId.value);

        onMounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.REGISTRY_PROJECT,
                DomainEventSubscriptionName.SUBSCRIBE,
            ), refs.entityId.value);

            socket.on(buildDomainEventFullName(
                DomainType.REGISTRY_PROJECT,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);
        });

        onUnmounted(() => {
            socket.emit(buildDomainEventSubscriptionFullName(
                DomainType.REGISTRY_PROJECT,
                DomainEventSubscriptionName.UNSUBSCRIBE,
            ), refs.entityId.value);

            socket.off(buildDomainEventFullName(
                DomainType.REGISTRY_PROJECT,
                DomainEventName.UPDATED,
            ), handleSocketUpdated);
        });

        const execute = async (command: RegistryAPICommand) => wrapFnWithBusyState(busy, async () => {
            if (!entity.value) return;

            try {
                await useAPI().service.runCommand(ServiceID.REGISTRY, command, {
                    id: entity.value.id,
                });

                emit('updated', entity.value);
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        })();

        if (!entity.value) {
            return () => h(
                'div',
                { class: 'alert alert-sm alert-warning' },
                [
                    'The registry-project details can not be displayed.',
                ],
            );
        }

        return () => h('div', [
            h('div', {
                class: 'mb-2 d-flex flex-column',
            }, [
                h('div', { class: 'form-group' }, [
                    h('label', { class: 'pe-1' }, 'Namespace'),
                    h('input', {
                        class: 'form-control',
                        type: 'text',
                        value: name.value,
                        disabled: true,
                    }),
                ]),

                h('div', [
                    h('div', { class: 'form-group' }, [
                        h('label', { class: 'pe-1' }, 'ID'),
                        h('input', {
                            class: 'form-control',
                            type: 'text',
                            value: accountName.value,
                            placeholder: '...',
                            disabled: true,
                        }),
                    ]),
                    h('div', { class: 'form-group' }, [
                        h('label', { class: 'pe-1' }, 'Secret'),
                        h('input', {
                            class: 'form-control',
                            type: 'text',
                            value: accountSecret.value,
                            disabled: true,
                            placeholder: '...',
                        }),
                    ]),
                ]),

                h('div', [
                    h('strong', { class: 'pe-1' }, 'Webhook:'),
                    h('i', {
                        class: {
                            'fa fa-check text-success': webhookExists.value,
                            'fa fa-times text-danger': !webhookExists.value,
                        },
                    }),
                ]),
            ]),
            h('hr'),
            h('div', { class: 'row' }, [
                h('div', { class: 'col' }, [
                    h('div', {
                        class: 'alert alert-sm alert-info',
                    }, [
                        'The link trigger will spin up the remote registry representation.',
                    ]),
                    h('div', { class: 'text-center' }, [
                        h('button', {
                            class: 'btn btn-xs btn-primary',
                            disabled: busy.value,
                            type: 'button',
                            onClick($event: any) {
                                $event.preventDefault();

                                return execute(RegistryAPICommand.PROJECT_LINK);
                            },
                        }, [
                            h('i', { class: 'fa-solid fa-link pe-1' }),
                            'Link',
                        ]),
                    ]),
                ]),
                h('div', { class: 'col' }, [
                    h('div', {
                        class: 'alert alert-sm alert-warning',
                    }, [
                        'The unlink trigger will remove the remote registry representation.',
                    ]),
                    h('div', { class: 'text-center' }, [
                        h('button', {
                            class: 'btn btn-xs btn-danger',
                            disabled: busy.value,
                            type: 'button',
                            onClick($event: any) {
                                $event.preventDefault();
                                return execute(RegistryAPICommand.PROJECT_UNLINK);
                            },
                        }, [
                            h('i', { class: 'fa-solid fa-link-slash pe-1' }),
                            'Unlink',
                        ]),
                    ]),
                ]),
            ]),
        ]);
    },
});
