<script>
    import {LayoutNavigationAdminId} from "../../config/layout";

    export default {
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility(can) {
                return can('use','admin_ui');
            }
        },
    }
</script>
<template>
    <div>
        <h4 class="title">
            Dashboard <span class="sub-title">Applikations-Verwaltung</span>
        </h4>

        <div class="panel-card">
            <div class="panel-card-body">
                <div class="alert alert-sm alert-info">
                    <h5>Herzlich Willkommen,</h5>
                    auf dem Admin Dashboard des Central User-Interfaces.<br />
                    Die auf der linken Seite befindlichen Menupunkte, dienen der graphischen Administration der Applikation.
                </div>
            </div>
        </div>
    </div>
</template>
