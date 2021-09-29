<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import Pagination from "@/components/Pagination";
import Vue from 'vue';
import {getRoles} from "@/domains/role/api";

export default {
    components: {Pagination},
    props: {
        filterItems: Function,
        requestFilters: Object,
        withSearch: {
            type: Boolean,
            default: true
        },
        loadOnInit: {
            type: Boolean,
            default: true
        }
    },
    watch: {
        q: function (val, oldVal) {
            if(val === oldVal) return;

            if(val.length === 1 && val.length > oldVal.length) {
                return;
            }

            this.meta.offset = 0;

            this.load();
        }
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
            q: '',
            meta: {
                limit: 10,
                offset: 0,
                total: 0
            },
            itemBusy: false
        }
    },
    created() {
        if(this.loadOnInit) {
            this.load();
        }
    },
    methods: {
        async load() {
            if(this.busy) return;

            this.busy = true;

            try {
                let data = {
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset
                    },
                    filter: {
                        name: this.q.length > 0 ? '~'+this.q : this.q
                    }
                }

                if(typeof this.requestFilters !== 'undefined') {
                    for(let key in this.requestFilters) {
                        data.filter[key] = this.requestFilters[key];
                    }
                }

                const response = await getRoles(data);

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
                        <h6 class="mb-0">Roles</h6>
                    </slot>
                </div>
                <div class="ml-auto">
                    <slot name="header-actions" v-bind:load="load" v-bind:busy="busy">
                        <div class="d-flex flex-row">
                            <div>
                                <button type="button" class="btn btn-xs btn-dark" :disabled="busy" @click.prevent="load">
                                    <i class="fas fa-sync"></i> Refresh
                                </button>
                            </div>
                            <div class="ml-2">
                                <nuxt-link to="/admin/roles/add" type="button" class="btn btn-xs btn-success">
                                    <i class="fa fa-plus"></i> Add
                                </nuxt-link>
                            </div>
                        </div>
                    </slot>
                </div>
            </div>
        </slot>
        <div class="form-group">
            <div class="input-group">
                <label for="permission-q"></label>
                <input v-model="q" type="text" name="q" id="permission-q" class="form-control" placeholder="Name..." autocomplete="new-password" />
                <div class="input-group-append">
                    <span class="input-group-text"><i class="fa fa-search"></i></span>
                </div>
            </div>
        </div>
        <slot name="items" v-bind:items="formattedItems" v-bind:busy="busy">
            <div class="c-list">
                <div class="c-list-item mb-2" v-for="(item,key) in formattedItems" :key="key">
                    <div class="c-list-content align-items-center">
                        <div class="c-list-icon">
                            <i class="fa fa-group"></i>
                        </div>
                        <slot name="item-name">
                            <span class="mb-0">{{item.name}}</span>
                        </slot>

                        <div class="ml-auto">
                            <slot name="item-actions" v-bind:item="item"></slot>
                        </div>
                    </div>
                </div>
            </div>
        </slot>

        <div v-if="!busy && formattedItems.length === 0" slot="no-more">
            <div class="alert alert-sm alert-info">
                No (more) roles available anymore.
            </div>
        </div>

        <pagination :total="meta.total" :offset="meta.offset" :limit="meta.limit" @to="goTo" />
    </div>
</template>
