<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    AuthClientCommand,
    SERVICE_ID,
    addAPIClient,
    executeAPIClientCommand,
    getAPIServiceClient,
} from '@personalhealthtrain/ui-common';

export default {
    props: {
        serviceId: SERVICE_ID,
    },
    data() {
        return {
            client: {
                busy: false,
                item: null,
            },
            busy: false,
        };
    },
    computed: {
        clientId() {
            return this.client.item ? this.client.item.id : '???';
        },
        clientSecret() {
            return this.client.item ? this.client.item.secret : '???';
        },
    },
    created() {
        this.getClient().then((r) => r);
    },
    methods: {
        async getClient() {
            this.client.busy = true;

            try {
                this.client.item = await getAPIServiceClient(this.serviceId);
            } catch (e) {

            }

            this.client.busy = false;
        },
        async doClientCommand(task) {
            if (this.busy || !this.clientId) return;

            this.busy = true;

            try {
                this.client.item = await executeAPIClientCommand(this.clientId, task, {});
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    toaster: 'b-toaster-top-center',
                });
            }

            this.busy = false;
        },
        async refreshSecret() {
            await this.doClientCommand(AuthClientCommand.SECRET_REFRESH);
        },
        async syncSecret() {
            await this.doClientCommand(AuthClientCommand.SECRET_SYNC);
        },

        async add() {
            if (this.busy || this.client.item) return;

            this.busy = true;

            try {
                this.client.item = await addAPIClient({
                    type: 'service',
                    id: this.serviceId,
                });
            } catch (e) {
                console.log(e);
            }

            this.busy = false;
        },
        async drop() {

        },
        close() {
            this.$emit('close');
        },
    },
};
</script>
<template>
    <div>
        <p>
            Client credentials (ID & Secret) are required to authenticate as a service against the Central UI.<br>
            Always <strong>sync</strong> the credentials, that the service can work properly.
        </p>

        <div class="mb-2">
            <template v-if="!client.busy">
                <template v-if="client.item">
                    <button
                        type="button"
                        class="btn btn-danger btn-xs"
                        :disabled="busy"
                        @click.prevent="drop"
                    >
                        <i class="fa fa-minus" /> Drop
                    </button>
                </template>
                <template v-else>
                    <button
                        type="button"
                        class="btn btn-success btn-xs"
                        :disabled="busy"
                        @click.prevent="add"
                    >
                        <i class="fa fa-plus" /> Add
                    </button>
                </template>
            </template>
        </div>

        <hr>

        <template v-if="client.busy">
            <div class="text-center">
                <div
                    class="spinner-border"
                    role="status"
                >
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </template>
        <template v-else>
            <template v-if="client.item">
                <h6>Details</h6>

                <div class="form-group">
                    <label>ID</label>
                    <input
                        type="text"
                        class="form-control"
                        :disabled="true"
                        :value="clientId"
                    >
                </div>

                <div class="form-group">
                    <label>Secret</label>
                    <input
                        type="text"
                        class="form-control"
                        :disabled="true"
                        :value="clientSecret"
                    >
                </div>

                <div>
                    <button
                        type="button"
                        class="btn btn-primary btn-xs"
                        :disabled="busy"
                        @click.prevent="syncSecret"
                    >
                        <i class="fa fa-sync-alt" /> Sync
                    </button>
                    <button
                        type="button"
                        class="btn btn-dark btn-xs"
                        :disabled="busy"
                        @click.prevent="refreshSecret"
                    >
                        <i class="fa fa-key" /> Refresh
                    </button>
                </div>
            </template>
        </template>
    </div>
</template>
