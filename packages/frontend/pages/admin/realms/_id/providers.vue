<script>
export default {
    props: {
        realm: Object
    },
    data() {
        return {
            sidebar: {
                hide: false,
                items: [
                    { name: 'OAuth2', urlSuffix: '', componentName: 'chat-rooms-index', icon: 'fa fa-info-circle'},
                ]
            },
            station: undefined,
            busy: false,
        }
    },

    methods: {

    }
}
</script>
<template>
    <div class="content-wrapper">
        <div class="content-sidebar">
            <b-nav pills vertical>
                <b-nav-item
                    v-for="(item,key) in sidebar.items"
                    :key="key"
                    :disabled="item.active"
                    :to="'/admin/realms/' +realm.id + '/providers'+ item.urlSuffix"
                    exact
                    exact-active-class="active"
                >
                    <i :class="item.icon" />
                    {{ item.name }}
                </b-nav-item>
            </b-nav>
        </div>
        <div class="content-container">
            <nuxt-child :realm="realm" />
        </div>
    </div>
</template>
