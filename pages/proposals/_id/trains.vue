<script>
    import TrainTable from "@/components/train/TrainTable";
    import TrainBasicForm from "@/components/train/TrainBasicForm";

    export default {
        meta: {
            requireAbility: (can) => {
                return can('add', 'train') || can('edit','train') || can('drop', 'train') ||
                    can('read', 'trainResult') ||
                    can('start', 'trainExecution') ||
                    can('stop', 'trainExecution');
            }
        },
        components: {TrainBasicForm, TrainTable},
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
        methods: {
            addTrain() {
                this.$refs['trainForm'].show();
            },
            handleCreated(train) {
                this.$refs['trainTable'].handleCreatedTrain(train);
                this.$refs['trainForm'].hide();
            }
        }
    }
</script>
<template>
    <div>
        <div class="panel-card">
            <div class="panel-card-body">
                <button type="button" class="btn btn-primary m-b-10" @click.prevent="addTrain">
                    <i class="fa fa-train"></i> add train
                </button>

                <div class="alert alert-primary alert-sm">
                    This is an overview of all created trains, either by you or a person of your station.
                </div>

                <div class="m-t-10">
                    <train-table ref="trainTable" :proposal-id="proposal.id" />
                </div>
            </div>
        </div>
        <b-modal
            size="lg"
            ref="trainForm"
            button-size="sm"
            title-html="<i class='fas fa-train'></i> Train"
            :no-close-on-backdrop="true"
            :no-close-on-esc="true"
            :hide-footer="true"
        >
            <train-basic-form :proposal-id="proposal.id" @created="handleCreated"/>
        </b-modal>
    </div>
</template>
