<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    buildRegistryHarborProjectName,
    executeAPIServiceHarborCommand,
    RegistryCommand,
} from "@personalhealthtrain/ui-common";

export default {
    props: {
        realm: Object,
        station: Object
    },
    data() {
        return {
            busy: false,
            command: RegistryCommand
        }
    },
    methods: {
        async doCommand(command) {
            if(this.busy || !this.station) return;

            this.busy = true;

            let title = 'Registry';
            let message = 'Succeeded...';
            let variant = 'success';

            switch (command) {
                case RegistryCommand.PROJECT_PULL:
                    title += ' - Check';
                    break;
                case RegistryCommand.PROJECT_CREATE:
                case RegistryCommand.PROJECT_DROP:
                    title += ' - Project';
                    break;
                case RegistryCommand.PROJECT_WEBHOOK_CREATE:
                case RegistryCommand.PROJECT_WEBHOOK_DROP:
                    title += ' - Project WebHook';
                    break;
                case RegistryCommand.PROJECT_ROBOT_ACCOUNT_CREATE:
                case RegistryCommand.PROJECT_ROBOT_ACCOUNT_DROP:
                    title += ' - Project Account';
                    break;
            }

            try {
                const data = await executeAPIServiceHarborCommand(command, {
                    name: buildRegistryHarborProjectName(this.station.id)
                });

                switch (command) {
                    case RegistryCommand.PROJECT_PULL:
                        message = 'Successfully checked harbor registry.';
                        break;
                    case RegistryCommand.PROJECT_CREATE:
                        message = 'Successfully made sure a harbor project exists.';
                        break;
                    case RegistryCommand.PROJECT_DROP:
                        message = 'Successfully dropped harbor project.';
                        break;
                    case RegistryCommand.PROJECT_WEBHOOK_CREATE:
                        message = 'Successfully made sure a registry web-hook exists.';
                        break;
                    case RegistryCommand.PROJECT_WEBHOOK_DROP:
                        message = 'Successfully dropped registry web-hook.';
                        break;
                    case RegistryCommand.PROJECT_ROBOT_ACCOUNT_CREATE:
                        message = 'Successfully made sure a registry account exists.';
                        break;
                    case RegistryCommand.PROJECT_ROBOT_ACCOUNT_DROP:
                        message = 'Successfully dropped registry account.';
                        break;
                }

                let additionalData = {}

                switch (command) {
                    case RegistryCommand.PROJECT_PULL:
                    case RegistryCommand.PROJECT_CREATE:
                        additionalData = {
                            registry_project_id: data.id,
                            registry_project_webhook_exists: !!data.webhook
                        };

                        if(data.robot_account) {
                            additionalData = {
                                ...additionalData,
                                registry_project_account_name: data.robot_account.name,
                                registry_project_account_token: data.robot_account.secret
                            };
                        }
                        break;
                    case RegistryCommand.PROJECT_DROP:
                        additionalData = {
                            registry_project_id: null,
                            registry_project_webhook_exists: false,
                            registry_project_account_name: null,
                            registry_project_account_token: null
                        };
                        break;
                    case RegistryCommand.PROJECT_WEBHOOK_CREATE:
                    case RegistryCommand.PROJECT_WEBHOOK_DROP:
                        additionalData = {
                            registry_project_webhook_exists: command === RegistryCommand.PROJECT_WEBHOOK_CREATE
                        }
                        break;
                    case RegistryCommand.PROJECT_ROBOT_ACCOUNT_CREATE:
                    case RegistryCommand.PROJECT_ROBOT_ACCOUNT_DROP:
                        additionalData = {
                            registry_project_account_name: command === RegistryCommand.PROJECT_ROBOT_ACCOUNT_CREATE ? data.name : null,
                            registry_project_account_token: command === RegistryCommand.PROJECT_ROBOT_ACCOUNT_CREATE ? data.secret : null
                        }
                        break;
                }

                this.$emit('updated', {
                    station: this.station,
                    ...additionalData
                });
            } catch (e) {
                variant = 'danger';
                message = e.message;
            }

            this.$bvToast.toast(message, {
                title,
                autoHideDelay: 5000,
                variant,
                toaster: 'b-toaster-top-center'
            });

            this.busy = false;
        }
    },
    computed: {
        projectName() {
            return buildRegistryHarborProjectName(this.station.secure_id);
        }
    }
}
</script>
<template>
    <div>
        <template v-if="station">
            <div class="mb-3">
                <h6><i class="fa fa-cog"></i> Settings</h6>

                <p class="mb-2">
                    To keep the data between the registry application and the ui in sync, you can
                    <strong>check the image registry </strong> for the corresponding information (project, webhook, account, etc)
                    and update the local data.
                </p>

                <p>
                    <strong>Namespace: </strong>{{projectName}}
                </p>

                <div class="d-flex flex-row">
                    <div class="mr-1">
                        <button
                            type="button"
                            class="btn btn-success btn-xs"
                            @click.prevent="doCommand(command.PROJECT_PULL)"
                        >
                            <i class="fa fa-sync"></i> Check
                        </button>
                    </div>

                    <div v-if="!station.registry_project_id">
                        <button type="button" class="btn btn-primary btn-xs" @click.prevent="doCommand(command.PROJECT_CREATE)" :disabled="busy" >
                            <i class="fas fa-bolt"></i> Create
                        </button>
                    </div>

                    <div v-if="station.registry_project_id">
                        <button
                            type="button"
                            class="btn btn-dark btn-xs"
                            @click.prevent="doCommand(command.PROJECT_DROP)"
                            :disabled="busy"
                        >
                            <i class="fa fa-trash"></i> Drop
                        </button>
                    </div>
                </div>
            </div>

            <hr />

            <div>
                <h6><i class="fa fa-sync"></i> Project Webhook</h6>

                <p class="mb-2">
                    Use the registry webhook to contact the local api endpoint, to notify the train router and the train result service for incoming trains or trains which must be proceed.
                </p>

                <div class="mb-2">
                    <b-form-checkbox button-variant="success" v-model="station.registry_project_webhook_exists" switch :disabled="true">
                        Exists?
                    </b-form-checkbox>
                </div>

                <template v-if="station.registry_project_id">
                    <button type="button" class="btn btn-primary btn-xs" @click.prevent="doCommand(command.PROJECT_WEBHOOK_CREATE)" :disabled="busy" v-if="!station.registry_project_webhook_exists">
                        <i class="fas fa-bolt"></i> Create
                    </button>

                    <button type="button" class="btn btn-dark btn-xs" @click.prevent="doCommand(command.PROJECT_WEBHOOK_DROP)" :disabled="busy">
                        <i class="fa fa-trash"></i> Drop
                    </button>
                </template>
            </div>

            <hr />

            <h6><i class="fa fa-user"></i> Project Account</h6>

            <p>
                Manage the station registry project user.
            </p>

            <div class="mb-2">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control" :value="station.registry_project_account_name" :disabled="true" placeholder="robot$account_name"  />
                </div>
                <div class="form-group">
                    <label>Token</label>
                    <input type="text" class="form-control" :value="station.registry_project_account_token" :disabled="true" placeholder="xxx"  />
                </div>
            </div>

            <template v-if="station.registry_project_id">
                <button type="button" class="btn btn-primary btn-xs" @click.prevent="doCommand(command.PROJECT_ROBOT_ACCOUNT_CREATE)" :disabled="busy" v-if="station.registry_project_id && !station.registry_project_account_token">
                    <i class="fas fa-bolt"></i> Create
                </button>
                <button type="button" class="btn btn-dark btn-xs" @click.prevent="doCommand(command.PROJECT_ROBOT_ACCOUNT_DROP)" :disabled="busy">
                    <i class="fa fa-trash"></i> Drop
                </button>
            </template>
        </template>
    </div>
</template>
