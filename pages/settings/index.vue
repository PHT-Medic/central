<template>
    <div class="">
        <div class="m-b-10">
            <h4 class="title">
                User
                <span class="sub-title">Einstellungen</span>
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
                    { name: 'Allgemein', routeName: 'settings-id', icon: 'fas fa-bars', urlSuffix: '' },
                    { name: 'Sicherheit', routeName: 'settings-id-security', icon: 'fas fa-user-secret', urlSuffix: 'security' },
                    //{ name: 'Benachrichtigungen', routeName: 'settings-id-notifications', icon: 'fa fa-bell', urlSuffix: 'notifications'}
                ]
            }
        },
    }
</script>
