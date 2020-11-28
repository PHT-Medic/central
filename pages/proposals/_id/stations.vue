<script>
export default {
    meta: {
        requireAbility: (can) => {
            return can('edit', 'proposal') || can('drop', 'proposal')
        }
    },
    props: {
        proposal: {
            type: Object,
            default () {
                return {};
            }
        },
        proposalStations: {
            type: Array,
            default () {
                return [];
            }
        }
    },
}
</script>
<template>
    <div class="panel-card">
        <div class="panel-card-header flex flex-row">
            <h6 class="title">
                Stationen: <span class="text-primary">{{proposalStations.length}}</span>
            </h6>
            <!--
            <div style="margin-left: auto;">
                <button type="button" class="btn btn-xs btn-success" :disabled="true">
                    Hinzufügen
                </button>
            </div>
            -->
        </div>
        <div class="panel-card-body">
            <b-list-group class="overflow-auto" style="height:500px;">
                <b-list-group-item v-for="(item,key) in proposalStations" class="flex-column align-items-start" :key="key">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1 font-weight-bold">{{item.station.name}}</h6>
                        <div>
                            <button type="button" class="btn btn-xs btn-danger" @click.prevent="dropStation(item)">
                                <i class="fa fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span class="font-weight-bold">Status:</span>
                            <proposal-station-status
                                :status="item.status"
                                v-slot:default="slotProps"
                            >
                                        <span class="badge" :class="slotProps.badgeClass">
                                            {{slotProps.statusText}}
                                        </span>
                            </proposal-station-status>
                        </div>
                        <div>
                            <span class="font-weight-bold">Kommentar:</span>
                            <p>
                                <template v-if="item.comment">
                                    {{item.comment}}
                                </template>
                                <template v-else>
                                    ...
                                </template>
                            </p>
                        </div>
                    </div>
                </b-list-group-item>
            </b-list-group>
        </div>
    </div>
</template>
