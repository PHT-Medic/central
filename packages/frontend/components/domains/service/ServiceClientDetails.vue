<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    ServiceID,
} from '@personalhealthtrain/ui-common';

export default {
    props: {
        serviceId: ServiceID,
    },
    data() {
        return {
            item: null,
            busy: false,
        };
    },
    computed: {
        clientId() {
            return this.item ? this.item.id : '???';
        },
        clientSecret() {
            return this.item ? this.item.secret : '???';
        },
    },
    created() {
        Promise.resolve(this.find);
    },
    methods: {
        async find() {
            if (this.busy) return;

            this.busy = true;

            try {
                this.client.item = await this.$authApi.robot.getOne(this.serviceId);
            } catch (e) {
                // ...
            }

            this.busy = false;
        },

        async add() {
            if (this.busy || this.item) return;

            this.busy = true;

            try {
                this.item = await this.$authApi.robot.create({
                    name: this.serviceId,
                });
            } catch (e) {
                console.log(e);
            }

            this.busy = false;
        },
        async drop() {
            if (this.busy || !this.item) return;

            this.busy = true;

            try {
                await this.$authApi.robot.delete(this.client.item.id);
            } catch (e) {
                console.log(e);
            }

            this.busy = false;
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
            <template v-if="item">
                <button
                    type="button"
                    class="btn btn-danger btn-xs"
                    :disabled="busy"
                    @click.prevent="drop"
                >
                    <i class="fa fa-trash" /> Delete
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
