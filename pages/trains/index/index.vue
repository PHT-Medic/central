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
    <div>
        <div class="alert alert-primary alert-sm">
            This is an overview of all created trains, either by you or a person of your station.
        </div>

        <div class="m-t-10">
            <train-table />
        </div>
    </div>
</template>
