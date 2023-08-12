/*
 * Copyright (c) 2022-2023.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type {
    RegistryProject,
} from '@personalhealthtrain/central-common';
import {
    DomainType,
    RegistryAPICommand,
    ServiceID,
    registryRobotSecretRegex,
} from '@personalhealthtrain/central-common';
import { buildFormInput } from '@vue-layout/form-controls';
import useVuelidate from '@vuelidate/core';
import {
    helpers,
} from '@vuelidate/validators';
import type { VNodeChild } from 'vue';
import {
    defineComponent, h, reactive, ref,
} from 'vue';
import type { SlotsType } from 'vue/dist/vue';
import type { EntityManagerSlotsType } from '../../core';
import {
    createEntityManager,
    defineEntityManagerEvents,
    defineEntityManagerProps, injectAPIClient,
    useValidationTranslator,
    wrapFnWithBusyState,
} from '../../core';

export default defineComponent({
    props: defineEntityManagerProps<RegistryProject>(),
    emits: defineEntityManagerEvents<RegistryProject>(),
    slots: Object as SlotsType<EntityManagerSlotsType<RegistryProject>>,
    async setup(props, setup) {
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

        // todo: add fields
        /*
            '+account_id',
            '+account_name',
            '+account_secret',
         */

        const manager = createEntityManager({
            type: `${DomainType.TRAIN}`,
            setup,
            props,
            onResolved(entity) {
                if (entity) {
                    form.secret = entity.account_secret || '';
                }
            },
            onUpdated(entity) {
                if (entity) {
                    form.secret = entity.account_secret || '';
                }
            },
        });

        await manager.resolve();

        const execute = async (command: RegistryAPICommand) => wrapFnWithBusyState(busy, async () => {
            if (!entity.value) return;

            try {
                await injectAPIClient().service.runCommand(ServiceID.REGISTRY, command, {
                    id: entity.value.id,
                    secret: form.secret,
                });

                setup.emit('updated', entity.value);
            } catch (e) {
                if (e instanceof Error) {
                    setup.emit('failed', e);
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

        return () => {
            const fallback = () : VNodeChild => h('div', [
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
                            validationTranslator: useValidationTranslator(),
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

            return manager.render(fallback);
        };
    },
});
