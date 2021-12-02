<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    SecretType, dropAPIUserSecret, getAPIUserSecrets, mergeDeep,
} from '@personalhealthtrain/ui-common';
import Vue from 'vue';
import Pagination from '../../Pagination';

export default {
    components: { Pagination },
    props: {
        filterItems: Function,
        query: {
            type: Object,
            default() {
                return {};
            },
        },
        loadOnInit: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            busy: false,
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },

            itemBusy: false,

            secretType: {
                constant: SecretType,
            },
        };
    },
    computed: {
        formattedItems() {
            if (typeof this.filterItems === 'undefined') {
                return this.items;
            }

            return this.items.filter(this.filterItems);
        },
    },
    created() {
        if (this.loadOnInit) {
            this.load();
        }
    },
    methods: {
        async load() {
            if (this.busy) return;

            this.busy = true;

            try {
                const response = await getAPIUserSecrets(mergeDeep({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                }, this.query));

                this.items = response.data;
                const { total } = response.meta;

                this.meta.total = total;
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
        async drop(id) {
            if (this.itemBusy) return;

            this.itemBusy = true;

            try {
                await dropAPIUserSecret(id);

                this.dropArrayItem({ id });

                this.$emit('deleted', { id });
            } catch (e) {
                // ...
            }

            this.itemBusy = false;
        },
        goTo(options, resolve, reject) {
            if (options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
        },

        dropArrayItem(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
            }
        },
        addArrayItem(item, atBeginning = false) {
            if (atBeginning) {
                this.items.unshift(item);
            } else {
                this.items.push(item);
            }
        },
        editArrayItem(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                // eslint-disable-next-line no-restricted-syntax
                for (const key in item) {
                    Vue.set(this.items[index], key, item[key]);
                }
            }
        },
    },
};
</script>
<template>
    <div>
        <slot name="header">
            <div class="d-flex flex-row mb-2">
                <div>
                    <slot name="header-title">
                        <h6 class="mb-0">
                            Overview
                        </h6>
                    </slot>
                </div>
                <div class="ml-auto">
                    <slot
                        name="header-actions"
                        :load="load"
                        :busy="busy"
                    >
                        <div class="d-flex flex-row">
                            <div>
                                <button
                                    type="button"
                                    class="btn btn-xs btn-dark"
                                    :disabled="busy"
                                    @click.prevent="load"
                                >
                                    <i class="fas fa-sync" /> Refresh
                                </button>
                            </div>
                            <slot
                                name="header-actions-extra"
                                :busy="busy"
                            />
                        </div>
                    </slot>
                </div>
            </div>
        </slot>
        <slot
            name="items"
            :items="formattedItems"
            :busy="busy"
        >
            <div class="c-list">
                <div
                    v-for="(item,key) in formattedItems"
                    :key="key"
                    class="c-list-item mb-2"
                >
                    <div class="c-list-header align-items-center">
                        <div class="c-list-icon">
                            <i class="fa fa-key" />
                        </div>
                        <slot
                            name="item-name"
                            :item="item"
                        >
                            <div class="mb-0">
                                <template v-if="item.type === secretType.constant.RSA_PUBLIC_KEY">
                                    <span class="badge badge-primary badge-pill">RSA</span>
                                </template>
                                <template v-else>
                                    <span class="badge badge-dark badge-box">Paillier</span>
                                </template>
                            </div>
                        </slot>

                        <div class="ml-auto">
                            <slot
                                name="item-actions"
                                :item="item"
                            >
                                <div class="d-flex flex-row">
                                    <div>
                                        <button
                                            type="button"
                                            class="btn btn-xs btn-danger"
                                            :disabled="itemBusy"
                                            @click.prevent="drop(item.id)"
                                        >
                                            <i class="fas fa-trash" />
                                        </button>
                                    </div>
                                    <slot
                                        name="item-actions-extra"
                                        :busy="busy"
                                        :item-busy="itemBusy"
                                        :item="item"
                                    />
                                </div>
                            </slot>
                        </div>
                    </div>

                    <div class="c-list-content">
                        <div class="">
                            <strong>Key:</strong> {{ item.key | str_length_limit(50) }}<br>
                            <strong>Content:</strong> {{ item.content | str_length_limit(50) }}
                        </div>
                    </div>
                </div>
            </div>
        </slot>

        <div
            v-if="!busy && formattedItems.length === 0"
            slot="no-more"
        >
            <div class="alert alert-sm alert-info">
                No secrets available.
            </div>
        </div>

        <pagination
            :total="meta.total"
            :offset="meta.offset"
            :limit="meta.limit"
            @to="goTo"
        />
    </div>
</template>
