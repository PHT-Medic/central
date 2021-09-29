<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
    import { mapActions } from 'vuex'

    export default {
        computed: {
            navigationId(vm) {
                return vm.$store.state.layout.navigationId;
            },
            components(vm) {
                return vm.$store.state.layout.navigationComponents;
            },
            loggedIn(vm)  {
                return vm.$store.getters['auth/loggedIn'];
            },
            user(vm)  {
                return vm.$store.state.auth.user;
            },
            infoText(vm) {
                return vm.user ? vm.user.realmId : 'Personal Health Train'
            }
        },
        methods: {
            ...mapActions('layout', [
                'selectNavigation'
            ]),
            componentClick($index) {
                const component = this.components[$index];

                this.selectNavigation(component.id);

                if (typeof component.url !== 'undefined') {
                    this.$router.push(component.url)
                }
            }
        }
    }
</script>
<template>
    <div>
        <header class="page-header fixed-top">
            <div class="header-title">
                <div class="toggle-box">
                    <button v-b-toggle="'page-navbar'" type="button" class="toggle-trigger">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar" />
                        <span class="icon-bar" />
                        <span class="icon-bar" />
                    </button>
                </div>
                <div class="logo">
                    <span>P</span>H<span>T</span>
                    <span class="info-text">{{ infoText }}</span>
                </div>
            </div>
            <nav class="page-navbar navbar-expand-md">
                <b-collapse id="page-navbar" class="navbar-content navbar-collapse">
                    <ul class="navbar-nav navbar-links">
                        <li v-for="(component,key) in components" :key="key" class="nav-item">
                            <a class="nav-link" :class="{'router-link-active': component.id === navigationId }" @click.prevent="componentClick(key)" href="javascript:void(0)" >
                                <i v-if="component.icon" :class="component.icon" /> {{ component.name }}
                            </a>
                        </li>
                    </ul>
                    <ul v-if="loggedIn && user" class="navbar-nav navbar-gadgets">
                        <li class="nav-item">
                            <nuxt-link class="nav-link user-link"  :to="'/users/'+user.id">
                                <v-gravatar :email="user.email ? user.email : ''" />
                                <span>{{ user.displayName ? user.displayName : user.name }}</span>
                            </nuxt-link>
                        </li>
                        <li class="nav-item">
                            <nuxt-link :to="'/settings'" class="nav-link">
                                <i class="fa fa-cog" />
                            </nuxt-link>
                        </li>
                        <li class="nav-item">
                            <nuxt-link :to="'/logout'" class="nav-link">
                                <i class="fa fa-power-off" />
                            </nuxt-link>
                        </li>
                    </ul>
                </b-collapse>
            </nav>
        </header>
    </div>
</template>
