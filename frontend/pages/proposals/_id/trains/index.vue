<script>
    import TrainTable from "@/components/train/TrainTable";
    import TrainBasicForm from "@/components/train/TrainBasicForm";
    import StationTrainTable from "@/components/station/StationTrainTable";

    export default {
        meta: {
            requireAbility: (can) => {
                return can('add', 'train') || can('edit','train') || can('drop', 'train') ||
                    can('read', 'trainResult') ||
                    can('start', 'trainExecution') ||
                    can('stop', 'trainExecution');
            }
        },
        components: {StationTrainTable, TrainBasicForm, TrainTable},
        props: {
            proposal: {
                type: Object,
                default () {
                    return {};
                }
            },
            visitorStation: {
                type: Object,
                default: undefined
            }
        },
        methods: {
        },
        computed: {
            stationId() {
                return this.visitorStation ? this.visitorStation.id : undefined;
            }
        }
    }
</script>
<template>
    <div>
        <div class="m-t-10">
            <template v-if="visitorStation">
                <station-train-table
                    ref="trainTable"
                    :proposal-id="proposal.id"
                    :station-id="stationId"
                />
            </template>
            <template v-else>
                <train-table
                    ref="trainTable"
                    :proposal-id="proposal.id"
                    :train-add-to="'/proposals/'+proposal.id+'/trains/add'"
                />
            </template>
        </div>
    </div>
</template>
