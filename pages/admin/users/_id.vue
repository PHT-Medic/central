<script>
    import {LayoutNavigationAdminId} from "../../../config/layout";
    import {getUser} from "@/domains/user/api.ts";

    export default {
        meta: {
            navigationId: LayoutNavigationAdminId,
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('edit','user') || can('user_permission_add') || can('user_permission_drop')
            }
        },
        async asyncData(context) {
            let user;

            try {
                user = await getUser(context.params.id);

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
                    { name: 'Gruppen', routeName: 'admin-users-id-groups', icon: 'fas fa-users', urlSuffix: 'groups' }
                ]
            }
        },
        methods: {
            handleUserUpdated(e) {
                for(let key in e) {
                    this.user[key] = e[key];
                }
            }
        }
    }
</script>
<template>
    <div class="container">
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

        <nuxt-child :user-property="user" @userUpdated="handleUserUpdated" />
    </div>
</template>
