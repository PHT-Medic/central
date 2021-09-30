<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {doAPIStationTask} from "@personalhealthtrain/ui-common/src";

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

            let title = 'Vault';
            let message = 'Succeeded...';
            let variant = 'success';

            switch (action) {
                case 'checkVault':
                    title += ' - Check';
                    break;
                case 'saveVaultPublicKey':
                case 'dropVaultPublicKey':
                    title += ' - Public Key';
                    break;
            }

            try {
                const station = await doAPIStationTask(this.station.id, action, {});

                switch (action) {
                    case 'checkHarbor':
                        message += 'Successfully checked vault db.';
                        break;
                    case 'saveVaultPublicKey':
                        message = 'Successfully saved public key to vault and the db...';
                        break;
                    case 'dropVaultPublicKey':
                        message = 'Successfully dropped public key from vault and the db...';
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
        <div>
            <template v-if="station">
                <div class="mb-3">
                    <h6><i class="fa fa-cog"></i> Settings</h6>

                    <p class="mb-2">
                        To keep the data between the vault key storage and the ui in sync, you can
                        <strong>check the key value storage (vault)</strong> for corresponding information.
                    </p>

                    <button
                        type="button"
                        class="btn btn-success btn-xs"
                        @click.prevent="doStationAction('checkVault')"
                        :disabled="busy"
                    >
                        <i class="fa fa-sync"></i> Check
                    </button>
                </div>

                <hr />

                <h6><i class="fa fa-key"></i> Public Key</h6>

                <p class="mb-2">
                    Sync the public key provided by the station to the vault key storage.
                </p>

                <button
                    type="button"
                    class="btn btn-primary btn-xs"
                    @click.prevent="doStationAction('saveVaultPublicKey')"
                    :disabled="busy"
                >
                    <i class="fa fa-save"></i> Save
                </button>

                <button
                    type="button"
                    class="btn btn-danger btn-xs"
                    @click.prevent="doStationAction('dropVaultPublicKey')"
                    :disabled="busy"
                    v-if="station.publicKey"
                >
                    <i class="fa fa-trash"></i> Drop
                </button>
            </template>
            <template v-else>
                <div class="alert alert-info alert-sm">
                    No station is created for the realm <strong>{{realm.name}}</strong> yet.
                </div>
            </template>
        </div>
    </div>
</template>
