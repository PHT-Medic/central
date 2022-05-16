<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { PropType } from 'vue';
import { Realm } from '@authelion/common';

export default {
    props: {
        entity: Object as PropType<Realm>,
    },
    data() {
        return {
            sidebar: {
                hide: false,
                items: [
                    {
                        name: 'Overview',
                        urlSuffix: '',
                        icon: 'fa fa-info-circle',
                    },
                    {
                        name: 'Add',
                        urlSuffix: '/add',
                        icon: 'fa fa-plus',
                    },
                ],
            },
        };
    },

    methods: {
        async handleDeleted() {
            this.$bvToast.toast('The provider was successfully deleted.', {
                toaster: 'b-toaster-top-center',
                variant: 'success',
            });
        },
    },
};
</script>
<template>
    <div class="content-wrapper">
        <div class="content-sidebar">
            <b-nav
                pills
                vertical
            >
                <b-nav-item
                    v-for="(item,key) in sidebar.items"
                    :key="key"
                    :disabled="item.active"
                    :to="'/settings/realm/providers'+ item.urlSuffix"
                    exact
                    exact-active-class="active"
                >
                    <i :class="item.icon" />
                    {{ item.name }}
                </b-nav-item>
            </b-nav>
        </div>
        <div class="content-container">
            <nuxt-child
                :entity="entity"
                @deleted="handleDeleted"
            />
        </div>
    </div>
</template>
