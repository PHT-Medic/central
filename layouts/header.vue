<script>
    import { mapGetters, mapActions } from 'vuex'
    import { LayoutService } from '../services/layout';



    export default {
        computed: {
            ...mapGetters('layout', [
                'navigationComponents',
                'navigationId',
            ]),
            ...mapGetters('auth', [
                'loggedIn',
                'user'
            ]),
            components: (vm) => {
                return LayoutService.reduceComponents({
                    components: vm.navigationComponents,
                    loggedIn: vm.loggedIn,
                    can: vm.$can
                }).map((component) => {
                    component.active = 'navigationId' in component && component.navigationId === vm.navigationId;
                    return component
                });
            }
        },
        methods: {
            ...mapActions('layout', [
                'selectNavigation'
            ]),
            checkAbility() {
                return this.$can(...arguments);
            },
            componentClick ($event, $index) {
                $event.preventDefault();

                const component = this.navigationComponents[$index];

                if (component.value === null) {
                    if ('navigationId' in component) {
                        this.selectNavigation(component.navigationId)
                    }
                } else {
                    this.$router.push(component.value)
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
                    <span class="info-text">Personal Health Train</span>
                </div>
            </div>
            <nav class="page-navbar navbar-expand-md">
                <b-collapse id="page-navbar" class="navbar-content navbar-collapse">
                    <ul class="navbar-nav navbar-links">
                        <li v-for="(component,key) in components" :key="key" class="nav-item">
                            <a v-if="!component.value" href="javascript:void(0)" class="nav-link" :class="{'router-link-active': component.active}" @click="componentClick($event,key)">
                                <i v-if="component.icon" :class="component.icon" /> {{ component.name }}
                            </a>
                        </li>
                    </ul>
                    <ul v-if="loggedIn && user" class="navbar-nav navbar-gadgets">
                        <li class="nav-item">
                            <nuxt-link class="nav-link user-link"  :to="'/users/'+user.id">
                                <v-gravatar :email="user.email" />
                                <span>{{ user.name }}</span>
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
