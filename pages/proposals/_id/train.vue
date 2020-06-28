<script>
    import TrainBuilder from "../../../components/train/TrainBuilder";
    export default {
        components: {TrainBuilder},
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
        data() {
            return {
                train: null
            }
        },
        methods: {
            selectTrain(id) {
                this.train = {
                    id
                };
            }
        }
    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Train-Builder
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <train-builder :proposal="proposal" :proposal-stations="proposalStations" :train="train" />
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Züge
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <div class="alert alert-primary">
                            Dies ist eine Übersicht aller bisher erstellten Züge.
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
