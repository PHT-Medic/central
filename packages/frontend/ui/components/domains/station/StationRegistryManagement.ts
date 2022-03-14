/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, PropType, VNode } from 'vue';
import { RegistryCommand, Station, buildRegistryStationProjectName } from '@personalhealthtrain/central-common';

export default Vue.extend({
    name: 'StationRegistryManagement',
    props: {
        entity: Object as PropType<Station>,
    },
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        projectName() {
            return buildRegistryStationProjectName(this.entity.secure_id);
        },
    },
    methods: {
        async createProject() {
            await this.run(RegistryCommand.STATION_SAVE);
        },
        async deleteProject() {
            await this.run(RegistryCommand.STATION_DELETE);
        },
        async run(command) {
            if (this.busy || !this.isEditing) return;

            this.busy = true;

            try {
                await this.$api.service.runRegistryCommand(command, {
                    id: this.entity.id,
                });

                // eslint-disable-next-line default-case
                switch (command) {
                    case RegistryCommand.STATION_DELETE:
                        this.$emit('updated', {
                            registry_project_id: null,
                            registry_project_account_id: null,
                            registry_project_account_name: null,
                            registry_project_account_token: null,
                            registry_project_webhook_exists: null,
                        });
                        break;
                }
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

        if (vm.entity.registry_project_account_name) {
            robotCredentials.push(h('div', [
                vm.entity.registry_project_account_name,
            ]));
        }

        if (vm.entity.registry_project_account_token) {
            robotCredentials.push(h('div', [
                vm.entity.registry_project_account_token,
            ]));
        }

        return h('div', [
            h('h6', [
                h('i', { staticClass: 'fa fa-folder-open pr-1' }),
                'Registry',
            ]),
            h('p', { staticClass: 'mb-2' }, [
                'To keep the data between the registry and the ui in sync, you can pull all available information about the',
                ' ',
                'project, webhook, robot-account,... of a station or create them.',
            ]),
            h('div', {
                staticClass: 'mb-2 d-flex flex-column',
            }, [
                h('div', [
                    h('strong', { staticClass: 'pr-1' }, 'Namespace:'),
                    vm.projectName,
                    h('i', {
                        staticClass: 'pl-1',
                        class: {
                            'fa fa-check text-success': vm.entity.registry_project_id,
                            'fa fa-times text-danger': !vm.entity.registry_project_id,
                        },
                    }),
                ]),

                h('div', [
                    h('strong', { staticClass: 'pr-1' }, 'Webhook:'),
                    h('i', {
                        class: {
                            'fa fa-check text-success': vm.entity.registry_project_webhook_exists,
                            'fa fa-times text-danger': !vm.entity.registry_project_webhook_exists,
                        },
                    }),
                ]),

                h('div', [
                    h('strong', { staticClass: 'pr-1' }, 'Robot:'),
                    h('div', { staticClass: 'd-flex flex-column' }, [
                        h('div', [
                            h('i', {
                                class: {
                                    'fa fa-check text-success': vm.entity.registry_project_account_id,
                                    'fa fa-times text-danger': !vm.entity.registry_project_account_id,
                                },
                            }),
                        ]),
                        robotCredentials,
                    ]),
                ]),
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

                                vm.createProject.call(null);
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

                                vm.deleteProject.call(null);
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
