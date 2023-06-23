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
    buildDomainEventSubscriptionFullName, registryRobotSecretRegex,
} from '@personalhealthtrain/central-common';
import { buildFormInput } from '@vue-layout/form-controls';
import useVuelidate from '@vuelidate/core';
import {
    helpers, maxLength, minLength, required,
} from '@vuelidate/validators';
import { merge } from 'smob';
import type { PropType } from 'vue';
import { computed, reactive } from 'vue';
import { realmIdForSocket } from '../../../composables/domain/realm';
import { buildValidationTranslator } from '../../../composables/ilingo';
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

        const form = reactive({
            secret: '',
        });

        const vuelidate = useVuelidate({
            secret: {
                registryRobotSecret: helpers.regex(registryRobotSecretRegex),
            },
        }, form);

        const init = () => {
            if (!entity.value) {
                return;
            }

            form.secret = entity.value.account_secret || '';
        };

        init();

        watch(entity, () => {
            init();
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
                    secret: form.secret,
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
                        value: entity.value?.external_name || '',
                        disabled: true,
                    }),
                ]),

                h('div', [
                    h('div', { class: 'form-group' }, [
                        h('label', { class: 'pe-1' }, 'ID'),
                        h('input', {
                            class: 'form-control',
                            type: 'text',
                            value: entity.value?.account_name || '',
                            placeholder: '...',
                            disabled: true,
                        }),
                    ]),
                    buildFormInput({
                        label: true,
                        labelContent: 'Secret',
                        props: {
                            placeholder: '...',
                        },
                        value: form.secret,
                        onChange(value) {
                            form.secret = value;
                        },
                        validationResult: vuelidate.value.secret,
                        validationTranslator: buildValidationTranslator(),
                    }),
                ]),

                h('div', [
                    h('strong', { class: 'pe-1' }, 'Webhook:'),
                    h('i', {
                        class: {
                            'fa fa-check text-success': entity.value?.webhook_exists,
                            'fa fa-times text-danger': !entity.value?.webhook_exists,
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
                        'Connect the database entity to the registry.',
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
                            h('i', { class: 'fa-solid fa-plug pe-1' }),
                            'Connect',
                        ]),
                    ]),
                ]),
                h('div', { class: 'col' }, [
                    h('div', {
                        class: 'alert alert-sm alert-warning',
                    }, [
                        'Disconnect the database entity of the registry.',
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
                            h('i', { class: 'fa-solid fa-power-off pe-1' }),
                            'Disconnect',
                        ]),
                    ]),
                ]),
            ]),
        ]);
    },
});
