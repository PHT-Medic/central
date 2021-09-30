<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {getAPIRole} from "@personalhealthtrain/ui-common/src";
    import {LayoutNavigationAdminId} from "../../../config/layout";

    export default {
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('edit','role') || can('role_permission_add') || can('role_permission_drop')
            }
        },
        async asyncData(context) {
            try {
                const role = await getAPIRole(context.params.id);

                return {
                    role
                }
            } catch (e) {
                return await context.redirect('/admin/roles');
            }
        },
        data() {
            return {
                role: null,
                tabs: [
                    { name: 'General', routeName: 'admin-roles-id', icon: 'fas fa-bars', urlSuffix: '' },
                    { name: 'Permissions', routeName: 'admin-roles-id-permissions', icon: 'fas fa-user-secret', urlSuffix: 'permissions' },
                    { name: 'Users', routeName: 'admin-roles-id-users', icon: 'fa fa-users', urlSuffix: 'users' }
                ]
            }
        }
    }
</script>
<template>
    <div class="container">
        <h1 class="title no-border mb-3">
            {{role.name}} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">

                    <b-nav pills>
                        <b-nav-item
                            :to="'/admin/roles'"
                            exact
                            exact-active-class="active"
                        >
                            <i class="fa fa-arrow-left" />
                        </b-nav-item>
                        <b-nav-item
                            v-for="(item,key) in tabs"
                            :key="key"
                            :disabled="item.active"
                            :to="'/admin/roles/' + role.id + '/' + item.urlSuffix"
                            exact
                            exact-active-class="active"
                        >
                            <i :class="item.icon" />
                            {{ item.name }}
                        </b-nav-item>
                    </b-nav>
                </div>
            </div>
        </div>

        <nuxt-child :role-property="role" />
    </div>
</template>
