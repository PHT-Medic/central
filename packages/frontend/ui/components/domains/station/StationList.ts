/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { BuildInput } from '@trapi/query';
import {
    Station, mergeDeep,
} from '@personalhealthtrain/central-common';
import {
    ComponentListData, ComponentListHandlerMethodOptions, ComponentListMethods, ComponentListProperties,
    PaginationMeta,
    buildListHeader,
    buildListItems,
    buildListNoMore, buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import Vue, { CreateElement, PropType, VNode } from 'vue';

export const StationList = Vue.extend<
ComponentListData<Station>,
ComponentListMethods<Station>,
any,
ComponentListProperties<Station>
>({
    name: 'StationList',
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<Station>>,
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
            Promise.resolve()
                .then(this.load);
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
                const query = mergeDeep({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                    filter: {
                        name: this.q.length > 0 ? `~${this.q}` : this.q,
                    },
                    sort: {
                        name: 'ASC',
                    },
                }, this.query);

                const response = await this.$api.station.getMany(query);

                this.items = response.data;
                const { total } = response.meta;

                this.meta.total = total;
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.busy = false;
        },

        handleCreated(
            item: Station,
            options?: ComponentListHandlerMethodOptions<Station>,
        ) {
            options = options || {};

            const index = this.items.findIndex((el: Station) => el.id === item.id);
            if (index === -1) {
                if (options.unshift) {
                    this.items.unshift(item);
                } else {
                    this.items.push(item);
                }
            }
        },
        handleUpdated(item: Station) {
            const index = this.items.findIndex((el: Station) => el.id === item.id);
            if (index !== -1) {
                const keys : (keyof Station)[] = Object.keys(item) as (keyof Station)[];
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }
        },
        handleDeleted(item: Station) {
            const index = this.items.findIndex((el: Station) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const header = buildListHeader(this, createElement, { titleText: 'Stations', iconClass: 'fa-solid fa-house-medical' });
        const search = buildListSearch(this, createElement);
        const items = buildListItems(this, createElement, { itemIconClass: 'fa-solid fa-house-medical' });
        const noMore = buildListNoMore(this, createElement, {
            text: 'There are no more stations available...',
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

export default StationList;
