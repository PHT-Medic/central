<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { PermissionID } from '@personalhealthtrain/central-common';

export default {
    meta: {
        requireLoggedIn: true,
    },
    computed: {
        user() {
            return this.$store.getters['auth/user'];
        },
        canManage() {
            return this.$auth.hasPermission(PermissionID.USER_EDIT);
        },
    },
};
</script>
<template>
    <div>
        <div class="row">
            <div class="col-12">
                <h6 class="title">
                    General
                </h6>

                <user-form
                    :can-manage="false"
                    :realm-id="user.realm_id"
                    :entity="user"
                />
            </div>
        </div>
    </div>
</template>
