<template>
    <div class="container">
        <div class="m-b-10">
            <h4 class="title">
                Settings
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
                            :to="'/settings/' + item.urlSuffix"
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
<script>
    export default {
        data () {
            return {
                tabs: [
                    { name: 'Account', routeName: 'settings-id', icon: 'fas fa-bars', urlSuffix: '' },
                    { name: 'Security', routeName: 'settings-id-security', icon: 'fa fa-lock', urlSuffix: 'security' },
                    { name: 'Keys', routeName: 'settings-id-key-ring', icon: 'fa fa-key', urlSuffix: 'key-ring'}
                    //{ name: 'Benachrichtigungen', routeName: 'settings-id-notifications', icon: 'fa fa-bell', urlSuffix: 'notifications'}
                ]
            }
        },
    }
</script>
