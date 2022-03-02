<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->

<script>
import {
    MasterImageCommand,
    REGISTRY_INCOMING_PROJECT_NAME, REGISTRY_MASTER_IMAGE_PROJECT_NAME,
    REGISTRY_OUTGOING_PROJECT_NAME, RegistryCommand,
    ServiceID,
} from '@personalhealthtrain/central-common';
import { MasterImageList } from '../../master-image/MasterImageList';

export default {
    components: { MasterImageList },
    props: {
        serviceId: ServiceID,
    },
    data() {
        return {
            busy: false,
            masterImagesMeta: {
                executed: false,
                created: '?',
                deleted: '?',
                updated: '?',
            },
            projectKey: {
                INCOMING: REGISTRY_INCOMING_PROJECT_NAME,
                OUTGOING: REGISTRY_OUTGOING_PROJECT_NAME,
                MASTER_IMAGE: REGISTRY_MASTER_IMAGE_PROJECT_NAME,
            },
        };
    },
    methods: {
        async setupProjects() {
            if (this.busy) return;

            this.busy = true;

            try {
                await this.$api.service.runCommand(this.serviceId, RegistryCommand.SETUP, {});

                this.$bvToast.toast('You successfully executed the setup routine.', {
                    toaster: 'b-toaster-top-center',
                });

                this.busy = false;
            } catch (e) {
                this.busy = false;

                this.$bvToast.toast(e.message, {
                    toaster: 'b-toaster-top-center',
                    variant: 'danger',
                });
            }
        },
        async syncMasterImages() {
            try {
                const { images } = await this.$api.masterImage
                    .runCommand(MasterImageCommand.SYNC_GIT_REPOSITORY);

                this.masterImagesMeta.executed = true;

                this.masterImagesMeta.created = images.created.length;
                this.masterImagesMeta.deleted = images.deleted.length;
                this.masterImagesMeta.updated = images.updated.length;

                await this.$refs['master-image-list'].load();
            } catch (e) {
                this.$bvToast.toast(e.message, {
                    toaster: 'b-toaster-top-center',
                    variant: 'danger',
                });
            }
        },
        async dropMasterImage(id) {
            try {
                await this.$api.masterImage.delete(id);

                this.$refs['master-image-list'].dropArrayItem(id);
            } catch (e) {
                // ...
            }
        },
    },
};
</script>
<template>
    <div>
        <h4><i class="fas fa-archive" /> Projects</h4>

        <div class="row">
            <div class="col">
                <h6><i class="fa fa-sign-in-alt" /> Incoming</h6>

                <p class="mb-1">
                    The incoming project is required for the <i>TrainBuilder</i> to work properly. When the TrainBuilder
                    is finished with building the train, the train will be pushed to the incoming project.
                    From there the TrainRouter can move it to the first station project of the route.
                </p>

                <hr>

                <h6><i class="fa fa-sign-out-alt" />Outgoing</h6>

                <p class="mb-1">
                    The outgoing project is required for the <i>ResultService</i> to pull the train from the
                    outgoing project and extract the results of the journey.
                </p>

                <hr>

                <h6><i class="fa fa-info" />  Info</h6>

                <p>
                    To setup or ensure the existence of all projects (incoming, outgoing, ...) and the corresponding webhooks run the setup routine.
                </p>

                <button
                    type="button"
                    class="btn btn-dark btn-xs"
                    :disabled="busy"
                    @click.prevent="setupProjects()"
                >
                    <i class="fa fa-cogs" /> Setup
                </button>
            </div>
            <div class="col">
                <h6><i class="fas fa-sd-card" /> Master Images</h6>
                <p>
                    The creation of the master image project, will also register a webhook,
                    which will keep the master images between the harbor service and the UI in sync.
                    It is also possible to manually sync the master images from harbor.
                </p>

                <div class="mb-1">
                    <button
                        type="button"
                        class="btn btn-success btn-xs"
                        :disabled="busy"
                        @click.prevent="addProject(projectKey.MASTER_IMAGE)"
                    >
                        <i class="fa fa-plus" /> Create
                    </button>
                    <button
                        type="button"
                        class="btn btn-xs btn-primary"
                        :disabled="busy"
                        @click.prevent="syncMasterImages(projectKey.MASTER_IMAGE)"
                    >
                        <i class="fa fa-sync" /> Sync
                    </button>
                </div>

                <p class="text-muted">
                    The last synchronisation
                    created <strong class="text-success">{{ masterImagesMeta.created }}</strong>,
                    updated <strong class="text-primary">{{ masterImagesMeta.updated }}</strong> and
                    deleted <strong class="text-danger">{{ masterImagesMeta.deleted }}</strong>
                    master image(s).
                </p>

                <master-image-list ref="master-image-list">
                    <template #header-title>
                        <strong>Overview</strong>
                    </template>
                    <template
                        #item-actions="{item}"
                    >
                        <button
                            type="button"
                            class="btn btn-danger btn-xs"
                            @click.prevent="dropMasterImage(item.id)"
                        >
                            <i class="fa fa-trash" />
                        </button>
                    </template>
                </master-image-list>
            </div>
        </div>
    </div>
</template>
