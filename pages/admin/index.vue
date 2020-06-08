<script>
    import {adminSidebarId} from "../../config/layout";

    export default {
        meta: {
            sidebarId: adminSidebarId,
            requiresAuth: true,
            requiresAbility(can) {
                return can('use','admin');
            }
        },
        data() {
            return {

            }
        },
        created() {
            console.log(this.$can('scale','shit'));
        }
    }
</script>
<template>
    <div>
        <h4 class="title">
            Admin <span class="sub-title">Dashboard</span>
        </h4>

        <div class="panel-card">
            <div class="panel-card-body">
                <can do="scale" on="shit">
                    <div class="alert alert-sm alert-dark h5 font-weight-bold">
                        Der Shit scaled <i class="fa fa-grin"></i>
                    </div>
                </can>
            </div>
        </div>
    </div>
</template>
