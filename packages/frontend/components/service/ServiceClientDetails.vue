<script>
import {doServiceClientTask} from "@/domains/service/api.ts";

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
                const service = await doServiceClientTask(this.serviceProperty.id, task);
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
            await this.doTask('refreshClientSecret');
        },
        async syncClient() {
            await this.doTask('syncClient');
        },

        close() {
            this.$emit('close');
        }
    }
}
</script>
<template>
    <div>
        <h6>{{service.id}}</h6>
        <div class="mb-1">
                Client synced?
                <i class="fa" :class="{
                'fa-check text-success': service.clientSynced,
                'fa-times text-danger': !service.clientSynced
            }" /> {{service.clientSynced ? 'true' : 'false'}}
        </div>
        <div class="alert alert-info alert-sm">
            If the client is <strong>synced</strong>, it means that either the security information in vault are updated or
            in case of HARBOR service, that the authorization credentials for the station webhooks are updated.
        </div>

        <div class="form-group">
            <label>Client ID</label>
            <input type="text" class="form-control" :disabled="true" :value="service.client.id">
        </div>

        <div class="form-group">
            <label>Client Secret</label>
            <input type="text" class="form-control" :disabled="true" :value="service.client.secret">
        </div>

        <div class="d-flex flex-row">
            <div>
                <button type="button" class="btn btn-primary btn-xs" @click.prevent="syncClient">
                    <i class="fa fa-sync-alt"></i> Sync
                </button>
                <button type="button" class="btn btn-dark btn-xs" @click.prevent="refreshClientSecret">
                    <i class="fa fa-key"></i> Refresh secret
                </button>
            </div>
            <div class="ml-auto">
                <button type="button" class="btn btn-secondary btn-xs" @click.prevent="close">
                    <i class="fa fa-times"></i> Close
                </button>
            </div>
        </div>

    </div>
</template>
