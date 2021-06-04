<script>
import TrainSvg from "@/components/svg/TrainSvg";
export default {
    components: {TrainSvg},
    data() {
        return {
            sidebar: {
                hide: false,
                items: [
                    {
                        name: 'Create',
                        urlSuffix: '/add',
                        icon: 'fa fa-plus'
                    },
                    {
                        name: 'Outgoing',
                        urlSuffix: '',
                        icon: 'fa fa-file-export'
                    },
                    {
                        name: 'Incoming',
                        urlSuffix: '/in',
                        icon: 'fa fa-file-import'
                    }
                ]
            }
        }
    }
}
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">Train(s) <span class="sub-title">manage and create new trains</span></h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <div class="text-center">
                    <train-svg width="100%" />
                </div>

                <b-nav pills vertical>
                    <b-nav-item
                        v-for="(item,key) in sidebar.items"
                        :key="key"
                        :disabled="item.active"
                        :to="'/trains' + item.urlSuffix"
                        exact
                        exact-active-class="active"
                    >
                        <i :class="item.icon" />
                        {{ item.name }}
                    </b-nav-item>
                </b-nav>
            </div>
            <div class="content-container">
                <nuxt-child />
            </div>
        </div>
    </div>
</template>
