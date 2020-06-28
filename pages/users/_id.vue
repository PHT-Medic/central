<script>
    import {adminNavigationId, defaultNavigationId} from "../../config/layout";
    import UserEdge from "../../services/edge/user/userEdge";

    export default {
        meta: {
            requireLoggedIn: true,
            navigationId: defaultNavigationId
        },
        async asyncData(context) {
            let user;

            try {
                user = await UserEdge.getUser(context.params.id);

                return {
                    user
                }
            } catch (e) {
                await context.redirect('/');
            }
        },
        data() {
            return {
                user: null,
                tabs: [
                    { name: 'Allgemein', routeName: 'users-id', icon: 'fas fa-bars', urlSuffix: '' }
                ]
            }
        }
    }
</script>
<template>
    <div class="">
        <div class="m-b-10">
            <h4 class="title">
                {{user.name}}
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
