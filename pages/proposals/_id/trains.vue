<template>
    <div>
        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <div class="text-center">
                    <proposal-svg width="100%" />
                </div>

                <b-nav pills vertical>
                    <b-nav-item
                        v-for="(item,key) in sidebar.items"
                        :key="key"
                        :disabled="item.active"
                        :to="'/proposals/' + proposal.id + '/trains' + item.urlSuffix"
                        exact
                        exact-active-class="active"
                    >
                        <i :class="item.icon" />
                        {{ item.name }}
                    </b-nav-item>
                </b-nav>
            </div>
            <div class="content-container">
                <nuxt-child :proposal="proposal" />
            </div>
        </div>
    </div>
</template>
<script>
import ProposalSvg from "@/components/svg/ProposalSvg";
export default {
    components: {ProposalSvg},
    props: {
        proposal: Object
    },
    data () {
        return {
            sidebar: {
                items: [
                    { name: 'Overview', routeName: 'settings-id', icon: 'fas fa-bars', urlSuffix: '' },
                    { name: 'Add', routeName: 'settings-id-security', icon: 'fa fa-plus', urlSuffix: '/add' }
                    //{ name: 'Benachrichtigungen', routeName: 'settings-id-notifications', icon: 'fa fa-bell', urlSuffix: 'notifications'}
                ]
            }
        }
    },
}
</script>
