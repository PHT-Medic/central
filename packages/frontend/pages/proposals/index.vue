<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import ProposalSvg from "../../components/svg/ProposalSvg";
import {Layout, LayoutNavigationID} from "../../modules/layout/contants";
export default {
    meta: {
        [Layout.REQUIRED_LOGGED_IN_KEY]: true,
        [Layout.NAVIGATION_ID_KEY]: LayoutNavigationID.DEFAULT
    },
    components: {ProposalSvg},
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
        <h1 class="title no-border mb-3">Proposal(s) <span class="sub-title">manage and create new proposals</span> </h1>

        <div class="content-wrapper">
            <div class="content-sidebar flex-column">
                <div>
                    <proposal-svg width="100%" height="auto" />
                </div>


                <b-nav pills vertical>
                    <b-nav-item
                        v-for="(item,key) in sidebar.items"
                        :key="key"
                        :disabled="item.active"
                        :to="'/proposals' + item.urlSuffix"
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
