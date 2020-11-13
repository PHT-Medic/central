<script>
    import {LayoutNavigationAdminId} from "../../../config/layout";
    import {getRole} from "@/domains/role/api.ts";

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
                const role = await getRole(context.params.id);

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
                    { name: 'Allgemein', routeName: 'admin-roles-id', icon: 'fas fa-bars', urlSuffix: '' },
                    { name: 'Berechtigungen', routeName: 'admin-roles-id-permissions', icon: 'fas fa-user-secret', urlSuffix: 'permissions' },
                    { name: 'Benutzer', routeName: 'admin-roles-id-users', icon: 'fa fa-users', urlSuffix: 'users' }
                ]
            }
        }
    }
</script>
<template>
    <div class="container">
        <h4 class="title">
            {{role.name}} <span class="sub-title">Details</span>
        </h4>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <b-nav pills>
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
