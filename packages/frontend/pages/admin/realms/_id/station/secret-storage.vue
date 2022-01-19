<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    SecretStorageCommand, buildStationSecretStorageKey,
} from '@personalhealthtrain/ui-common';

export default {
    props: {
        realm: Object,
        station: Object,
    },
    data() {
        return {
            busy: false,
            command: SecretStorageCommand,
        };
    },
    computed: {
        pathName() {
            return buildStationSecretStorageKey(this.station.secure_id);
        },
    },
    methods: {
        async doStationAction(action) {
            if (this.busy || !this.station) return;

            this.busy = true;

            const title = 'Secret Storage';
            let message = 'Succeeded...';
            let variant = 'success';

            try {
                const station = await this.$api.service.runSecretStorageCommand(action, {
                    name: buildStationSecretStorageKey(this.station.id),
                });

                // eslint-disable-next-line default-case
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
                toaster: 'b-toaster-top-center',
            });

            this.busy = false;
        },
    },
};
</script>
<template>
    <div>
        <div>
            <template v-if="station">
                <div class="mb-3">
                    <h6><i class="fa fa-cog" /> Settings</h6>

                    <p class="mb-2">
                        To keep the data between the secret key storage engine and the ui in sync, you can
                        either <strong>pull</strong> existing secrets from the storage engine or <strong>push</strong> local secrets against it.
                    </p>

                    <p>
                        <strong>Path: </strong> {{ pathName }}
                    </p>

                    <div class="d-flex flex-row">
                        <div>
                            <button
                                type="button"
                                class="btn btn-dark btn-xs"
                                :disabled="busy"
                                @click.prevent="doStationAction(command.ENGINE_KEY_PULL)"
                            >
                                <i
                                    class="fa fa-chevron-down"
                                    aria-hidden="true"
                                /> Pull
                            </button>
                            <button
                                type="button"
                                class="btn btn-success btn-xs"
                                :disabled="busy"
                                @click.prevent="doStationAction(command.ENGINE_KEY_SAVE)"
                            >
                                <i
                                    class="fa fa-chevron-up"
                                    aria-hidden="true"
                                /> Push
                            </button>
                        </div>
                        <div class="ml-auto">
                            <button
                                type="button"
                                class="btn btn-danger btn-xs"
                                :disabled="busy || !station.public_key"
                                @click.prevent="doStationAction(command.ENGINE_KEY_DROP)"
                            >
                                <i class="fa fa-trash" /> Drop
                            </button>
                        </div>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="alert alert-info alert-sm">
                    No station is created for the realm <strong>{{ realm.name }}</strong> yet.
                </div>
            </template>
        </div>
    </div>
</template>
