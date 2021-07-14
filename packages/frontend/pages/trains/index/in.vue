<script>
import {LayoutNavigationDefaultId} from "@/config/layout.ts";
import StationTrainTable from "@/components/station/StationTrainTable";
import {getStations} from "@/domains/station/api";

export default {
    components: {StationTrainTable},
    meta: {
        navigationId: LayoutNavigationDefaultId,
        requireLoggedIn: true,
        requireAbility: (can) => {
            return can('approve', 'train');
        }
    },
    async asyncData(ctx) {
        try {
            const {data: stations} = await getStations({
                filter: {
                    realmId: ctx.store.getters['auth/userRealmId']
                }
            });

            return {
                viewerStation: stations.length === 1 ? stations[0] : null
            }
        } catch (e) {
            console.log(e);
        }
    },
    data() {
        return {
            viewerStation: null
        }
    },
}
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
