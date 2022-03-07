/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import {
    SettingsOption,
    mergeDeep,
} from '@personalhealthtrain/central-common';
import Vue, { CreateElement, PropType, VNode } from 'vue';
import {
    ComponentListData, ComponentListHandlerMethodOptions, ComponentListMethods, ComponentListProperties,
    PaginationMeta,
    buildListHeader,
    buildListItems,
    buildListNoMore, buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import { BuildInput } from '@trapi/query';

export const ArchitectureList = Vue.extend<
ComponentListData<SettingsOption>,
ComponentListMethods<SettingsOption>,
any,
ComponentListProperties<SettingsOption>
>({
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<SettingsOption>>,
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
                const response = await this.$api.architecture.getMany(mergeDeep({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                    filter: {
                        title: this.q.length > 0 ? `~${this.q}` : this.q,
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

        handleCreated(
            item: SettingsOption,
            options?: ComponentListHandlerMethodOptions<SettingsOption>,
        ) {
            options = options || {};

            const index = this.items.findIndex((el: SettingsOption) => el.id === item.id);
            if (index === -1) {
                if (options.unshift) {
                    this.items.unshift(item);
                } else {
                    this.items.push(item);
                }
            }
        },
        handleUpdated(item: SettingsOption) {
            const index = this.items.findIndex((el: SettingsOption) => el.id === item.id);
            if (index !== -1) {
                const keys : (keyof SettingsOption)[] = Object.keys(item) as (keyof SettingsOption)[];
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }
        },
        handleDeleted(item: SettingsOption) {
            const index = this.items.findIndex((el: SettingsOption) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const header = buildListHeader(this, createElement, { titleText: 'Architectures', iconClass: 'fa-brands fa-unity' });
        const search = buildListSearch(this, createElement);
        const items = buildListItems(this, createElement, {
            itemIconClass: 'fa-brands fa-unity',
            itemSlots: {
                handleUpdated: vm.handleUpdated,
                handleDeleted: vm.handleDeleted,
            },
        });
        const noMore = buildListNoMore(this, createElement, {
            text: createElement('div', { staticClass: 'alert alert-sm alert-info' }, [
                'There are no more architectures available...',
            ]),
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

export default ArchitectureList;
