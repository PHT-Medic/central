<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Pagination from "@/components/Pagination";
import Vue from 'vue';
import {getStations} from "@/domains/station/api";

export default {
    components: {Pagination},
    props: {
        filterItems: Function
    },
    computed: {
        formattedItems() {
            if(typeof this.filterItems === 'undefined') {
                return this.items;
            }

            return this.items.filter(this.filterItems);
        }
    },
    data() {
        return {
            busy: false,
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            },
            itemBusy: false
        }
    },
    created() {
        this.load();
    },
    methods: {
        async load() {
            if(this.busy) return;

            this.busy = true;

            try {
                const response = await getStations({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    }
                });

                this.items = response.data;
                const {total} = response.meta;

                this.meta.total = total;
            } catch (e) {

            }

            this.busy = false;
        },
        goTo(options, resolve, reject) {
            if(options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
        },

        addArrayItem(item) {
            this.items.push(item);
        },
        editArrayItem(item) {
            const index = this.items.findIndex(el => el.id === item.id);
            if(index !== -1) {
                for(let key in item) {
                    Vue.set(this.items[index], key, item[key]);
                }
            }
        }
    }
}
</script>
<template>
    <div>
        <slot name="header">
            <div class="d-flex flex-row mb-2">
                <div>
                    <slot name="header-title">
                        <h6 class="mb-0">Stations</h6>
                    </slot>
                </div>
                <div class="ml-auto">
                    <slot name="header-actions"></slot>
                </div>
            </div>
        </slot>
        <div class="c-list">
            <div class="c-list-item mb-2" v-for="(item,key) in formattedItems" :key="key">
                <div class="c-list-content align-items-center">
                    <div class="c-list-icon">
                        <i class="fa fa-hospital"></i>
                    </div>
                    <span class="mb-0">{{item.name}}</span>

                    <div class="ml-auto">
                        <slot name="actions" v-bind:item="item"></slot>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="!busy && formattedItems.length === 0" slot="no-more">
            <div class="alert alert-sm alert-info">
                No (more) stations available anymore.
            </div>
        </div>

        <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />
    </div>
</template>
