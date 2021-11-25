<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID, getAPIStations } from '@personalhealthtrain/ui-common';
import StationTrainTable from '../../../components/domains/station/StationTrainTable';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout/contants';

export default {
    components: { StationTrainTable },
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.TRAIN_APPROVE,
        ],
    },
    async asyncData(ctx) {
        try {
            const { data: stations } = await getAPIStations({
                filter: {
                    realm_id: ctx.store.getters['auth/userRealmId'],
                },
            });

            return {
                viewerStation: stations.length === 1 ? stations[0] : null,
            };
        } catch (e) {
            console.log(e);
        }
    },
    data() {
        return {
            viewerStation: null,
        };
    },
};
</script>
<template>
    <div>
        <div class="alert alert-primary alert-sm">
            This is an overview of all incoming trains from other stations, that want to run an algorithm on your infrastructure.
        </div>

        <div class="m-t-10">
            <template v-if="viewerStation">
                <station-train-table :station-id="viewerStation.id" />
            </template>
        </div>
    </div>
</template>
