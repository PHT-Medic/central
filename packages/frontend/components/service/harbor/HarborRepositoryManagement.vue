<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script>
import {
    dropAPIMasterImage,
    executeAPIServiceTask,
    HARBOR_INCOMING_PROJECT_NAME, HARBOR_MASTER_IMAGE_PROJECT_NAME,
    HARBOR_OUTGOING_PROJECT_NAME,
    HarborCommand
} from "@personalhealthtrain/ui-common"
import MasterImageList from "../../master-image/MasterImageList";

export default {
    components: {MasterImageList},
    props: {
        service: Object
    },
    data() {
        return {
            busy: false,
            masterImagesMeta: {
                executed: false,
                created: '?',
                deleted: '?'
            }
        }
    },
    methods: {
        async executeTask(task, taskData = {}) {
            if(this.busy) return;

            this.busy = true;

            try {
                const data = await executeAPIServiceTask(this.service.id, task, taskData);

                this.$bvToast.toast('You successfully executed the harbor command.', {
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

        async addIncomingRepository() {
            await this.executeTask(HarborCommand.REPOSITORY_CREATE, {
                name: HARBOR_INCOMING_PROJECT_NAME,
                webhook: true
            });
        },
        async addOutgoingRepository() {
            await this.executeTask(HarborCommand.REPOSITORY_CREATE, {
                name: HARBOR_OUTGOING_PROJECT_NAME,
                webhook: true
            });
        },

        async addMasterImageRepository() {
            await this.executeTask(HarborCommand.REPOSITORY_CREATE, {
                name: HARBOR_MASTER_IMAGE_PROJECT_NAME,
                webhook: true
            });
        },
        async syncMasterImageRepository() {
            const {data, meta} = await this.executeTask(HarborCommand.REPOSITORY_SYNC, {
                name: HARBOR_MASTER_IMAGE_PROJECT_NAME
            });

            this.masterImagesMeta.executed = true;

            this.masterImagesMeta.created = meta.created;
            this.masterImagesMeta.deleted = meta.deleted;

            if(Array.isArray(data)) {
                data.map(item => this.$refs["master-image-list"].addArrayItem(item));
            }
        },
        async dropMasterImage(id) {
            try {
                await dropAPIMasterImage(id);

                this.$refs["master-image-list"].dropArrayItem(id);
            } catch (e) {

            }
        }
    }
}
</script>
<template>
    <div>
        <h4><i class="fas fa-archive"></i> Repositories</h4>

        <div class="row mb-3">
            <div class="col">
                <h6><i class="fa fa-sign-in-alt"></i> Incoming</h6>

                <p class="mb-1">
                    The incoming repository is required for the <i>TrainBuilder</i> to work properly. When the TrainBuilder
                    is finished with building the train, the train will be pushed to the incoming repository.
                    From there the TrainRouter can move it to the first station repository of the route.
                </p>

                <button type="button" class="btn btn-primary btn-xs" @click.prevent="addIncomingRepository" :disabled="busy">
                    <i class="fa fa-wrench"></i> Create
                </button>
            </div>
            <div class="col">
                <h6><i class="fa fa-sign-out-alt"></i>Outgoing</h6>

                <p class="mb-1">
                    The outgoing repository is required for the <i>ResultService</i> to pull the train from the
                    outgoing repository and extract the results of the journey.
                </p>

                <button type="button" class="btn btn-primary btn-xs" @click.prevent="addOutgoingRepository" :disabled="busy">
                    <i class="fa fa-wrench"></i> Create
                </button>
            </div>
        </div>

        <hr />

        <h6><i class="fas fa-sd-card"></i> Master Images</h6>
        <div class="row">
            <div class="col">
                <p>
                    The creation of the master image repository, will also register a webhook,
                    which will keep the master images between the harbor service and the UI in sync.
                    It is also possible to manually sync the master images from harbor.
                </p>

                <div class="mb-1">
                    <button type="button" class="btn btn-xs btn-primary" :disabled="busy" @click.prevent="addMasterImageRepository">
                        <i class="fa fa-wrench"></i> Create
                    </button>
                    <button type="button" class="btn btn-xs btn-success" :disabled="busy" @click.prevent="syncMasterImageRepository">
                        <i class="fa fa-sync"></i> Sync
                    </button>
                </div>


                <p class="text-muted">
                    The last synchronisation
                    created <strong class="text-success">{{ masterImagesMeta.created }}</strong> and
                    deleted <strong class="text-danger">{{ masterImagesMeta.deleted }}</strong>
                    master image(s).
                </p>
            </div>
            <div class="col">
                <master-image-list ref="master-image-list">
                    <template slot="header-title">
                        <strong>Overview</strong>
                    </template>
                    <template slot="item-actions" slot-scope="{ item }">
                        <button type="button" class="btn btn-danger btn-xs" @click.prevent="dropMasterImage(item.id)">
                            <i class="fa fa-trash"></i>
                        </button>
                    </template>
                </master-image-list>
            </div>
        </div>
    </div>
</template>
