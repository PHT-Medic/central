<script>
import ProposalStationStatus from "@/components/proposal/ProposalStationStatus";

export default {
    components:{
        ProposalStationStatus
    },
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
    <div>

    </div>
</template>
