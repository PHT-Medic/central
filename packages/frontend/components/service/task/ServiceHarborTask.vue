<script>
import {executeServiceTask} from "~/domains/service/api";

export default {
    props: {
        service: Object
    },
    data() {
        return {
            busy: false,

            syncMasterImagesMeta: {
                executed: false,
                created: '?',
                deleted: '?'
            }
        }
    },
    methods: {
        async executeTask(task) {
            if(this.busy) return;

            this.busy = true;

            try {
                const data = await executeServiceTask(this.service.id, task, {});

                this.$bvToast.toast('You successfully executed the service task.', {
                    toaster: 'b-toaster-top-center'
                });

                this.busy = false;

                return data;
            } catch (e) {
                this.busy = false;

                this.$bvToast.toast(e.message, {
                    toaster: 'b-toaster-top-center',
                    variant: 'danger'
                })
            }
        },
        async syncMasterImages() {
            const {meta} = await this.executeTask('syncMasterImages');

            this.syncMasterImagesMeta.executed = true;

            this.syncMasterImagesMeta.created = meta.created;
            this.syncMasterImagesMeta.deleted = meta.deleted;
        },
        async registerWebhookForMasterImages() {
            await this.executeTask('registerWebhookForMasterImages');
        }
    }
}
</script>
<template>
    <div>
        <h6><i class="fas fa-sd-card"></i> Master Image(s)</h6>

        <div class="row">
            <div class="col">
                <strong>Webhook</strong>
                <p>
                    To keep the master images between the harbor service and the UI in sync, you can setup a webhook, so that in case a new master image is created,
                    it is registered automatically in the UI few seconds later.
                </p>

                <button type="button" class="btn btn-xs btn-success" :disabled="busy" @click.prevent="registerWebhookForMasterImages">
                    <i class="fa fa-plus"></i> Register
                </button>
            </div>
            <div class="col">
                <strong>Sync</strong>
                <p>
                    To keep the master images between the harbor service and the UI in sync, you can check the image registry (harbor) for unregistered master images and sync them.
                    <br />
                    The last task execution resulted in
                    <strong class="text-success">{{ syncMasterImagesMeta.created }}</strong> created and
                    <strong class="text-danger">{{syncMasterImagesMeta.deleted}}</strong> deleted
                    master image(s).
                </p>

                <button type="button" class="btn btn-xs btn-primary" :disabled="busy" @click.prevent="syncMasterImages">
                    <i class="fa fa-sync"></i> Sync
                </button>
            </div>
        </div>

    </div>
</template>
