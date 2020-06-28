<script>
    import UserEdge from "../../../services/edge/user/userEdge";
    import {adminNavigationId} from "../../../config/layout";

    export default {
        meta: {
            navigationId: adminNavigationId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('edit','user') || can('user_permission_add') || can('user_permission_drop')
            }
        },
        async asyncData(context) {
            let user;

            try {
                user = await UserEdge.getUser(context.params.id);

                return {
                    user
                }
            } catch (e) {
                await context.redirect('/admin/users');
            }
        },
        data() {
            return {
                user: null,
                tabs: [
                    { name: 'Allgemein', routeName: 'admin-users-id', icon: 'fas fa-bars', urlSuffix: '' },
                    { name: 'Sicherheit', routeName: 'admin-users-id-security', icon: 'fas fa-user-secret', urlSuffix: 'security' },
                    { name: 'Gruppen', routeName: 'admin-users-id-groups', icon: 'fas fa-users', urlSuffix: 'groups' }
                ]
            }
        }
    }
</script>
<template>
    <div>
        <h4 class="title">
            {{user.name}} <span class="sub-title">Details</span>
        </h4>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <b-nav pills>
                        <b-nav-item
                            v-for="(item,key) in tabs"
                            :key="key"
                            :disabled="item.active"
                            :to="'/admin/users/' + user.id + '/' + item.urlSuffix"
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

        <nuxt-child :provided-user="user" />
    </div>
</template>
