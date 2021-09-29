<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {doStationTask} from "@/domains/station/api";

export default {
    props: {
        realm: Object,
        station: Object
    },
    data() {
        return {
            busy: false
        }
    },
    methods: {
        async doStationAction(action) {
            if(this.busy || !this.station) return;

            this.busy = true;

            let title = 'Harbor';
            let message = 'Succeeded...';
            let variant = 'success';

            switch (action) {
                case 'checkHarbor':
                    title += ' - Check';
                    break;
                case 'ensureHarborProject':
                case 'dropHarborProject':
                    title += ' - Project';
                    break;
                case 'ensureHarborProjectWebHook':
                case 'dropHarborProjectWebHook':
                    title += ' - Project WebHook';
                    break;
                case 'ensureHarborProjectAccount':
                case 'dropHarborProjectAccount':
                    title += ' - Project Account';
                    break;
            }

            try {
                const station = await doStationTask(this.station.id, action, {});

                switch (action) {
                    case 'checkHarbor':
                        message = 'Successfully checked harbor registry.';
                        break;
                    case 'ensureHarborProject':
                        message = 'Successfully made sure a harbor project exists...';
                        break;
                    case 'dropHarborProject':
                        message = 'Successfully dropped harbor project...';
                        break;
                    case 'ensureHarborProjectWebHook':
                        message = 'Successfully made sure a harbor web-hook exists...';
                        break;
                    case 'dropHarborProjectWebHook':
                        message = 'Successfully dropped harbor web-hook...';
                        break;
                    case 'ensureHarborProjectAccount':
                        message = 'Successfully made sure a harbor exists exists...';
                        break;
                    case 'dropHarborProjectAccount':
                        message = 'Successfully dropped harbor account...';
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
    }
}
</script>
<template>
    <div>
        <template v-if="station">
            <div class="mb-3">
                <h6><i class="fa fa-cog"></i> Settings</h6>

                <p class="mb-2">
                    To keep the data between the harbor application and the ui in sync, you can
                    <strong>check the train image registry (harbor)</strong> for the corresponding information (project, webhook, account, etc)
                    and extend the local data.
                </p>

                <button
                    type="button"
                    class="btn btn-success btn-xs"
                    @click.prevent="doStationAction('checkHarbor')"
                >
                    <i class="fa fa-sync"></i> Check
                </button>
            </div>

            <hr />

            <div class="row mb-3">
                <div class="col">
                    <h6><i class="fa fa-file-code"></i> Project</h6>

                    <p class="mb-2">
                        The harbor project is the image repository for the station to pull images.
                    </p>

                    <div class="mb-2">
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" class="form-control" :value="station.harborProjectId ? 'station_'+station.secureId : ''" :disabled="true" placeholder="Project ID" />
                        </div>

                        <div class="form-group">
                            <label>Path</label>
                            <input type="text" class="form-control" :value="station.harborProjectId ? '/harbor/projects/'+station.harborProjectId : ''" :disabled="true" placeholder="Project Path" />
                        </div>
                    </div>

                    <button type="button" class="btn btn-primary btn-xs" @click.prevent="doStationAction('ensureHarborProject')" :disabled="busy" v-if="!station.harborProjectId">
                        <i class="fas fa-bolt"></i> Create
                    </button>

                    <button
                        type="button"
                        class="btn btn-dark btn-xs"
                        @click.prevent="doStationAction('dropHarborProject')"
                        :disabled="busy"
                    >
                        <i class="fa fa-trash"></i> Drop
                    </button>
                </div>
                <div class="col">
                    <h6><i class="fa fa-sync"></i> Project Webhook</h6>

                    <p class="mb-2">
                        Use the harbor webhook to contact the local api endpoint, to notify the train router and the train result service for incoming trains or trains which must be proceed.
                    </p>

                    <div class="mb-2">
                        <b-form-checkbox button-variant="success" v-model="station.harborProjectWebhookExists" switch :disabled="true">
                            Exists?
                        </b-form-checkbox>
                    </div>

                    <template v-if="station.harborProjectId">
                        <button type="button" class="btn btn-primary btn-xs" @click.prevent="doStationAction('ensureHarborProjectWebHook')" :disabled="busy" v-if="!station.harborProjectWebhookExists">
                            <i class="fas fa-bolt"></i> Create
                        </button>

                        <button type="button" class="btn btn-dark btn-xs" @click.prevent="doStationAction('dropHarborProjectWebHook')" :disabled="busy">
                            <i class="fa fa-trash"></i> Drop
                        </button>
                    </template>
                </div>
            </div>

            <hr />

            <h6><i class="fa fa-user"></i> Project Account</h6>

            <div class="alert alert-dark alert-sm">
                Manage the station harbor repository user.
            </div>

            <div class="mb-2">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" class="form-control" :value="station.harborProjectAccountName" :disabled="true" placeholder="robot$account_name"  />
                </div>
                <div class="form-group">
                    <label>Token</label>
                    <textarea type="text" class="form-control" :value="station.harborProjectAccountToken" :disabled="true" placeholder="token" rows="14">

                    </textarea>
                </div>
            </div>

            <template v-if="station.harborProjectId">
                <button type="button" class="btn btn-primary btn-xs" @click.prevent="doStationAction('ensureHarborProjectAccount')" :disabled="busy" v-if="station.harborProjectId && !station.harborProjectAccountToken">
                    <i class="fas fa-bolt"></i> Create
                </button>
                <button type="button" class="btn btn-dark btn-xs" @click.prevent="doStationAction('dropHarborProjectAccount')" :disabled="busy">
                    <i class="fa fa-trash"></i> Drop
                </button>
            </template>
        </template>
    </div>
</template>
