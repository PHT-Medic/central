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
        }
    }
</script>
<template>
    <div>
        <div class="m-t-10">
            <train-table
                ref="trainTable"
                :proposal-id="proposal.id"
                :train-add-to="'/proposals/'+proposal.id+'/trains/add'"
            />
        </div>
    </div>
</template>
