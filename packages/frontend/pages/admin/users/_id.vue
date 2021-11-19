<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import {getAPIUser, PermissionID} from "@personalhealthtrain/ui-common";
    import {Layout, LayoutNavigationID} from "../../../modules/layout/contants";

    export default {
        meta: {
            [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.ADMIN,
            [Layout.REQUIRED_LOGGED_IN_KEY]: true,
            [Layout.REQUIRED_PERMISSIONS_KEY]: [
                PermissionID.USER_EDIT,
                PermissionID.USER_ROLE_ADD,
                PermissionID.USER_ROLE_EDIT,
                PermissionID.USER_ROLE_DROP
            ]
        },
        async asyncData(context) {
            let user;

            try {
                user = await getAPIUser(context.params.id, {fields: ['+email']});

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
                    { name: 'General', routeName: 'admin-users-id', icon: 'fas fa-bars', urlSuffix: '' },
                    { name: 'Roles', routeName: 'admin-users-id-groups', icon: 'fas fa-users', urlSuffix: 'roles' }
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
        <h1 class="title no-border mb-3">
            {{user.name}} <span class="sub-title">Details</span>
        </h1>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <b-nav pills>
                        <b-nav-item
                            :to="'/admin/users'"
                            exact
                            exact-active-class="active"
                        >
                            <i class="fa fa-arrow-left" />
                        </b-nav-item>
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
