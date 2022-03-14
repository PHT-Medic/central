/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, PropType, VNode } from 'vue';
import { MasterImage, mergeDeep } from '@personalhealthtrain/central-common';
import {
    ComponentListData,
    ComponentListHandlerMethodOptions,
    ComponentListMethods,
    ComponentListProperties,
    PaginationMeta,
    buildListHeader,
    buildListItems,
    buildListNoMore, buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import { BuildInput } from '@trapi/query';

export const MasterImageList = Vue.extend<
ComponentListData<MasterImage>,
ComponentListMethods<MasterImage>,
any,
ComponentListProperties<MasterImage>
>({
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<MasterImage>>,
            default() {
                return {};
            },
        },
        withHeader: {
            type: Boolean,
            default: true,
        },
        withNoMore: {
            type: Boolean,
            default: true,
        },
        withPagination: {
            type: Boolean,
            default: true,
        },
        withSearch: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            busy: false,
            items: [],
            q: '',
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
            itemBusy: false,
        };
    },
    computed: {
        itemsFinal() {
            const { items } = this;
            return items.sort((a, b) => a.path.toLocaleString().localeCompare(b.path));
        },
    },
    watch: {
        q(val, oldVal) {
            if (val === oldVal) return;

            if (val.length === 1 && val.length > oldVal.length) {
                return;
            }

            this.meta.offset = 0;

            this.load();
        },
    },
    created() {
        if (this.loadOnInit) {
            this.load();
        }
    },
    methods: {
        async load(options?: PaginationMeta) {
            if (this.busy) return;

            if (options) {
                this.meta.offset = options.offset;
            }

            this.busy = true;

            try {
                const response = await this.$api.masterImage.getMany(mergeDeep({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                    filter: {
                        path: this.q.length > 0 ? `~${this.q}` : this.q,
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
        goTo(options, resolve, reject) {
            if (options.offset === this.meta.offset) return;

            this.meta.offset = options.offset;

            this.load()
                .then(resolve)
                .catch(reject);
        },

        handleCreated(
            item: MasterImage,
            options?: ComponentListHandlerMethodOptions<MasterImage>,
        ) {
            options = options || {};

            const index = this.items.findIndex((el: MasterImage) => el.id === item.id);
            if (index === -1) {
                if (options.unshift) {
                    this.items.unshift(item);
                } else {
                    this.items.push(item);
                }
            }
        },
        handleUpdated(item: MasterImage) {
            const index = this.items.findIndex((el: MasterImage) => el.id === item.id);
            if (index !== -1) {
                const keys : (keyof MasterImage)[] = Object.keys(item) as (keyof MasterImage)[];
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }
        },
        handleDeleted(item: MasterImage) {
            const index = this.items.findIndex((el: MasterImage) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;

        const header = buildListHeader(this, createElement, {
            titleText: 'MasterImages',
            iconClass: 'fa fa-compact-disc',
        });

        const search = buildListSearch(this, createElement);

        const items = buildListItems<MasterImage>(this, createElement, {
            itemIconClass: 'fa fa-compact-disc',
            itemTextFn(item) {
                return createElement('span', [
                    item.name,
                    ' ',
                    createElement(
                        'small',
                        {
                            staticClass: 'text-primary',
                        },
                        [
                            item.path,
                        ],
                    ),
                ]);
            },
            itemSlots: {
                handleDeleted: vm.handleDeleted,
                handleUpdated: vm.handleUpdated,
            },
        });

        const noMore = buildListNoMore(this, createElement, {
            text: 'There are no more master-images available...',
        });
        const pagination = buildListPagination(this, createElement);

        return createElement(
            'div',
            { staticClass: 'list' },
            [
                header,
                search,
                items,
                noMore,
                pagination,
            ],
        );
    },
});
