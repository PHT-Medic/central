<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    buildSecretStorageStationKey,
    executeAPISecretStorageServiceCommand,
    SecretStorageCommand
} from "@personalhealthtrain/ui-common";

export default {
    props: {
        realm: Object,
        station: Object
    },
    data() {
        return {
            busy: false,
            command: SecretStorageCommand
        }
    },
    methods: {
        async doStationAction(action) {
            if(this.busy || !this.station) return;

            this.busy = true;

            let title = 'Secret Storage';
            let message = 'Succeeded...';
            let variant = 'success';

            try {
                const station = await executeAPISecretStorageServiceCommand(action, {
                    name: buildSecretStorageStationKey(this.station.id)
                });

                switch (action) {
                    case SecretStorageCommand.ENGINE_KEY_PULL:
                        message += 'Successfully pull secrets from storage engine.';
                        break;
                    case SecretStorageCommand.ENGINE_KEY_SAVE:
                        message = 'Successfully saved secrets to storage engine.';
                        break;
                    case SecretStorageCommand.ENGINE_KEY_DROP:
                        message = 'Successfully dropped secrets from storage engine.';
                        break;
                }

                this.$emit('updated', station);
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
        pathName() {
            return buildSecretStorageStationKey(this.station.secure_id);
        }
    }
}
</script>
<template>
    <div>
        <div>
            <template v-if="station">
                <div class="mb-3">
                    <h6><i class="fa fa-cog"></i> Settings</h6>

                    <p class="mb-2">
                        To keep the data between the secret key storage engine and the ui in sync, you can
                        either <strong>pull</strong> existing secrets from the storage engine or <strong>push</strong> local secrets against it.
                    </p>

                    <p>
                        <strong>Path: </strong> {{pathName}}
                    </p>

                    <div class="d-flex flex-row">
                        <div>
                            <button
                                type="button"
                                class="btn btn-dark btn-xs"
                                @click.prevent="doStationAction(command.ENGINE_KEY_PULL)"
                                :disabled="busy"
                            >
                                <i class="fa fa-chevron-down" aria-hidden="true"></i> Pull
                            </button>
                            <button
                                type="button"
                                class="btn btn-success btn-xs"
                                @click.prevent="doStationAction(command.ENGINE_KEY_SAVE)"
                                :disabled="busy"
                            >
                                <i class="fa fa-chevron-up" aria-hidden="true"></i> Push
                            </button>
                        </div>
                        <div class="ml-auto">
                            <button
                                type="button"
                                class="btn btn-danger btn-xs"
                                @click.prevent="doStationAction(command.ENGINE_KEY_DROP)"
                                :disabled="busy || !station.public_key"
                            >
                                <i class="fa fa-trash"></i> Drop
                            </button>
                        </div>
                    </div>

                </div>


            </template>
            <template v-else>
                <div class="alert alert-info alert-sm">
                    No station is created for the realm <strong>{{realm.name}}</strong> yet.
                </div>
            </template>
        </div>
    </div>
</template>
