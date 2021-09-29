<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {executeServiceClientTask} from "@/domains/service/api.ts";

export default {
    props: {
        serviceProperty: Object
    },
    data() {
        return {
            service: null,
            busy: false
        }
    },
    created() {
        this.service = this.serviceProperty;
    },
    methods: {
        async doTask(task) {
            if(this.busy) return;

            this.busy = true;

            try {
                const service = await executeServiceClientTask(this.serviceProperty.id, task, {});
                this.service = service;
                this.$emit('updated', service);
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    toaster: 'b-toaster-top-center'
                })
            }

            this.busy = false;
        },
        async refreshClientSecret() {
            await this.doTask('refreshSecret');
        },
        async syncClient() {
            await this.doTask('sync');
        },

        close() {
            this.$emit('close');
        }
    }
}
</script>
<template>
    <div>
        <p>
            Client credentials (ID & Secret) are required to authenticate as a service against the Central UI.<br />
            Always <strong>sync</strong> the credentials, that the service can work properly.
        </p>
        <div class="mb-1">
            <i class="fa fa-sync"></i> Synced?
                <i class="fa" :class="{
                'fa-check text-success': service.clientSynced,
                'fa-times text-danger': !service.clientSynced
            }" /> {{service.clientSynced ? 'true' : 'false'}}
        </div>

        <hr />

        <div class="form-group">
            <label>ID</label>
            <input type="text" class="form-control" :disabled="true" :value="service.client.id">
        </div>

        <div class="form-group">
            <label>Secret</label>
            <input type="text" class="form-control" :disabled="true" :value="service.client.secret">
        </div>

        <div>
            <button type="button" class="btn btn-primary btn-xs" @click.prevent="syncClient">
                <i class="fa fa-sync-alt"></i> Sync
            </button>
            <button type="button" class="btn btn-dark btn-xs" @click.prevent="refreshClientSecret">
                <i class="fa fa-key"></i> Refresh secret
            </button>
        </div>
    </div>
</template>
