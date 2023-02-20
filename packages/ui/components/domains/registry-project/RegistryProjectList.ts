/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import type { BuildInput } from 'rapiq';
import type { RegistryProject } from '@personalhealthtrain/central-common';
import { mergeDeep } from '@personalhealthtrain/central-common';
import type {
    ComponentListData, ComponentListHandlerMethodOptions, ComponentListMethods, ComponentListProperties,
    PaginationMeta,
} from '@vue-layout/utils';
import {
    buildListHeader,
    buildListItems,
    buildListNoMore, buildListPagination, buildListSearch,
} from '@vue-layout/utils';
import type { CreateElement, PropType, VNode } from 'vue';
import Vue from 'vue';

export const RegistryProjectList = Vue.extend<
ComponentListData<RegistryProject>,
ComponentListMethods<RegistryProject>,
any,
ComponentListProperties<BuildInput<RegistryProject>>
>({
    name: 'RegistryProjectList',
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<RegistryProject>>,
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

                const response = await this.$api.registryProject.getMany(query);

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
            item: RegistryProject,
            options?: ComponentListHandlerMethodOptions<RegistryProject>,
        ) {
            options = options || {};

            const index = this.items.findIndex((el: RegistryProject) => el.id === item.id);
            if (index === -1) {
                if (options.unshift) {
                    this.items.unshift(item);
                } else {
                    this.items.push(item);
                }
            }
        },
        handleUpdated(item: RegistryProject) {
            const index = this.items.findIndex((el: RegistryProject) => el.id === item.id);
            if (index !== -1) {
                const keys : (keyof RegistryProject)[] = Object.keys(item) as (keyof RegistryProject)[];
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }
        },
        handleDeleted(item: RegistryProject) {
            const index = this.items.findIndex((el: RegistryProject) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const header = buildListHeader(this, createElement, { titleText: 'Registry-Projects', iconClass: 'fa-solid fa-diagram-project' });
        const search = buildListSearch(this, createElement);
        const items = buildListItems(this, createElement, { itemIconClass: 'fa-solid fa-diagram-project' });
        const noMore = buildListNoMore(this, createElement, {
            text: 'There are no more registry projects available...',
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

export default RegistryProjectList;
