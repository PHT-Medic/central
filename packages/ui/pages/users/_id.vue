<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { LayoutKey, LayoutNavigationID } from '../../config/layout/contants';

export default {
    meta: {
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.DEFAULT,
    },
    async asyncData(context) {
        let user;

        try {
            user = await context.$authApi.user.getOne(context.params.id);

            return {
                user,
            };
        } catch (e) {
            await context.redirect('/');

            return {};
        }
    },
    data() {
        return {
            user: null,
            tabs: [
                {
                    name: 'Allgemein', routeName: 'users-id', icon: 'fas fa-bars', urlSuffix: '',
                },
            ],
        };
    },
};
</script>
<template>
    <div class="">
        <div class="m-b-10">
            <h4 class="title">
                {{ user.name }}
                <span class="sub-title">Profil</span>
            </h4>
        </div>

        <div class="m-b-20 m-t-10">
            <div class="panel-card">
                <div class="panel-card-body">
                    <b-nav pills>
                        <b-nav-item
                            v-for="(item,key) in tabs"
                            :key="key"
                            :disabled="item.active"
                            :to="'/users/' + user.id + '/' + item.urlSuffix"
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
        <nuxt-child />
    </div>
</template>
