<script>
import {LayoutNavigationDefaultId} from "@/config/layout.ts";
import TrainTable from "@/components/train/TrainTable";

export default {
    components: {TrainTable},
    meta: {
            navigationId: LayoutNavigationDefaultId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add', 'train') || can('edit', 'train') || can('drop','read') ||
                    can('read', 'trainResult') ||
                    can('start', 'trainExecution') ||
                    can('stop', 'trainExecution');
            }
        }
    }
</script>
<template>
    <div class="container">
        <h4 class="title">
            Trains <span class="sub-title">An overview of all created trains by your station</span>
        </h4>

        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-primary alert-sm">
                    This is an overview of all created trains, either by you or a person of your station.
                </div>

                <div class="m-t-10">
                    <train-table />
                </div>
            </div>
        </div>
    </div>
</template>
