<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<template>
    <realm-form @created="handleCreated" />
</template>
<script>
import {PermissionID} from "@personalhealthtrain/ui-common";
import RealmForm from "../../../../components/domains/realm/RealmForm";
import {LayoutKey} from "../../../../config/layout/contants";
export default {
    components: {RealmForm},
    meta: {
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionID.REALM_ADD
        ]
    },
    methods: {
        handleCreated(realm) {
            this.$router.push('/admin/realms/'+realm.id);
        }
    }
}
</script>
