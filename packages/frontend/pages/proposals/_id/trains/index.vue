<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import TrainTable from "../../../../components/train/TrainTable";
    import TrainBasicForm from "../../../../components/train/TrainBasicForm";
    import StationTrainTable from "../../../../components/station/StationTrainTable";

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
            station_id() {
                return this.visitorStation ? this.visitorStation.id : undefined;
            }
        }
    }
</script>
<template>
    <div>
        <div class="m-t-10">
            <template v-if="visitorStation">
                mmhhh station train table missing :) !!!
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
