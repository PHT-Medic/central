/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */
import { SecretType, UserSecret, mergeDeep } from '@personalhealthtrain/central-common';
import Vue, { CreateElement, PropType, VNode } from 'vue';
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

export const UserSecretList = Vue.extend<
ComponentListData<UserSecret>,
ComponentListMethods<UserSecret>,
any,
ComponentListProperties<UserSecret>
>({
    props: {
        loadOnInit: {
            type: Boolean,
            default: true,
        },
        query: {
            type: Object as PropType<BuildInput<UserSecret>>,
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
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
            q: '',

            itemBusy: false,
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
                const response = await this.$api.userSecret.getMany(mergeDeep({
                    page: {
                        limit: this.meta.limit,
                        offset: this.meta.offset,
                    },
                    filter: {
                        key: this.q.length > 0 ? `~${this.q}` : this.q,
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
                await this.$api.userSecret.delete(id);

                this.dropArrayItem({ id });

                this.$emit('deleted', { id });
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.itemBusy = false;
        },

        handleCreated(
            item: UserSecret,
            options?: ComponentListHandlerMethodOptions<UserSecret>,
        ) {
            options = options || {};

            const index = this.items.findIndex((el: UserSecret) => el.id === item.id);
            if (index === -1) {
                if (options.unshift) {
                    this.items.unshift(item);
                } else {
                    this.items.push(item);
                }
            }
        },
        handleUpdated(item: UserSecret) {
            const index = this.items.findIndex((el: UserSecret) => el.id === item.id);
            if (index !== -1) {
                const keys : (keyof UserSecret)[] = Object.keys(item) as (keyof UserSecret)[];
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }
        },
        handleDeleted(item: UserSecret) {
            const index = this.items.findIndex((el: UserSecret) => el.id === item.id);
            if (index !== -1) {
                this.items.splice(index, 1);
                this.meta.total--;
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const header = buildListHeader(this, createElement, { titleText: 'Secrets', iconClass: 'fa fa-key' });
        const search = buildListSearch(this, createElement);
        const items = buildListItems<UserSecret>(this, createElement, {
            itemIconClass: 'fa fa-key',
            itemSlots: {
                handleDeleted: vm.handleDeleted,
                handleUpdated: vm.handleUpdated,
                handleCreated: vm.handleCreated,
            },
            itemTextFn(item) {
                return [
                    createElement(
                        'span',
                        {
                            staticClass: 'badge badge-pill',
                            class: {
                                'badge-primary': item.type === SecretType.RSA_PUBLIC_KEY,
                                'badge-dark': item.type === SecretType.PAILLIER_PUBLIC_KEY,
                            },
                        },
                        [
                            (item.type === SecretType.PAILLIER_PUBLIC_KEY ? 'Paillier' : 'RSA'),
                        ],
                    ),
                    createElement(
                        'span',
                        {
                            staticClass: 'ml-1',
                        },
                        [item.key],
                    ),
                ];
            },
        });

        const noMore = buildListNoMore(this, createElement, {
            text: createElement('div', { staticClass: 'alert alert-sm alert-info' }, [
                'There are no more secrets available...',
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

export default UserSecretList;
