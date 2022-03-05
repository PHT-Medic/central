/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, VNode } from 'vue';
import { required } from 'vuelidate/lib/validators';
import { buildFormSelect } from '@vue-layout/utils';
import { MasterImageList } from './MasterImageList';
import { buildVuelidateTranslator } from '../../../config/ilingo/utils';

export const MasterImagePicker = Vue.extend({
    name: 'MasterImagePicker',
    components: { MasterImageList },
    props: {
        entityId: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            form: {
                group_virtual_path: '',
                master_image_id: '',
            },

            item: null,
            busy: false,

            group: {
                items: [],
                busy: false,
                item: null,
            },
        };
    },
    validations() {
        return {
            form: {
                group_virtual_path: {
                    required,
                },
                master_image_id: {
                    required,
                },
            },
        };
    },
    computed: {
        isVirtualGroupPathDefined() {
            return !!this.form.group_virtual_path &&
                this.form.group_virtual_path.length > 0;
        },
        imageQuery() {
            return {
                filters: {
                    ...(this.form.group_virtual_path !== '' ? {
                        group_virtual_path: this.form.group_virtual_path,
                    } : {}),
                },
            };
        },
        isInImageList() {
            if (!this.$refs.itemList || !this.form.master_image_id) {
                return false;
            }

            const index = this.$refs.itemList.items.findIndex((el) => el.id === this.form.master_image_id);
            return index !== -1;
        },
    },
    watch: {
        async entityId(val, oldVal) {
            if (this.loading) return;

            if (val && val !== oldVal) {
                this.initProperties();
                await this.loadImage();
            }
        },
    },
    created() {
        Promise.resolve()
            .then(this.initProperties)
            .then(this.loadGroups)
            .then(this.loadImage);
    },
    methods: {
        initProperties() {
            if (this.entityId) {
                this.form.master_image_id = this.entityId;
            }
        },
        async loadImage() {
            if (!this.form.master_image_id) return;

            if (
                this.item &&
                this.item === this.form.master_image_id
            ) {
                this.form.group_virtual_path = this.item.group_virtual_path;
                return;
            }

            this.busy = true;

            try {
                this.item = await this.$api.masterImage.getOne(this.form.master_image_id);
                this.form.group_virtual_path = this.item.group_virtual_path;

                await this.setGroup(this.item.group_virtual_path);
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
        async loadGroups() {
            if (this.group.busy) return;

            this.group.busy = true;

            try {
                const { data } = await this.$api.masterImageGroup.getMany();

                this.group.items = data;
            } catch (e) {
                // ...
            }

            this.group.busy = false;
        },

        async setGroup(virtualPath: string) {
            if (!virtualPath) {
                this.form.group_virtual_path = '';
                this.group.item = null;

                return;
            }

            const index = this.group.items.findIndex((item) => item.virtual_path === virtualPath);
            if (index !== -1) {
                this.form.group_virtual_path = this.group.items[index].virtual_path;

                if (
                    this.group.item &&
                    this.group.item.virtual_path !== this.group.items[index].virtual_path
                ) {
                    this.form.master_image_id = '';
                    this.item = null;
                    this.$emit('selected', null);
                }

                this.group.item = this.group.items[index];
            }

            this.$nextTick(async () => {
                if (this.$refs.itemList) {
                    await this.$refs.itemList.load();
                }
            });
        },

        setImage(item) {
            if (item) {
                if (typeof item === 'string') {
                    const index = this.$refs.itemList.items.findIndex((el) => el.id === item);
                    if (index !== -1) {
                        item = this.$refs.itemList.items[index];
                    } else {
                        item = {
                            id: item,
                        };
                    }
                }

                if (this.group.item) {
                    item.command = item.command || this.group.item.command;
                    item.command_arguments = item.command_arguments || this.group.item.command_arguments;
                }

                this.$emit('selected', item);
            } else {
                this.$emit('selected', null);
            }
        },
    },
    render(createElement: CreateElement): VNode {
        const vm = this;
        const h = createElement;

        const groupOptions = vm.group.items.map((item) => ({
            id: item.virtual_path,
            value: item.virtual_path,
        }));

        let masterImages = h();

        if (vm.isVirtualGroupPathDefined) {
            masterImages = h('div', {
                staticClass: 'col',
            }, [
                h(MasterImageList, {
                    ref: 'itemList',
                    props: {
                        withHeader: false,
                        withSearch: false,
                        withPagination: false,
                        query: vm.imageQuery,
                    },
                    scopedSlots: {
                        items(props) {
                            return buildFormSelect(vm, h, {
                                validationTranslator: buildVuelidateTranslator(this.$ilingo),
                                options: props.items.map((item) => ({
                                    id: item.id,
                                    value: item.name,
                                })),
                                propName: 'master_image_id',
                                domProps: {
                                    disabled: props.busy,
                                },
                                attrs: {
                                    disabled: props.busy,
                                },
                                title: [
                                    'Image',
                                    (vm.form.master_image_id ?
                                        h('i', { staticClass: 'ml-1 fa fa-check text-success' }) :
                                        h()
                                    ),
                                ],
                                changeCallback(value) {
                                    vm.setImage.call(null, { id: value });
                                },
                            });
                        },
                    },
                }),
            ]);
        }

        return h(
            'div',
            { staticClass: 'row' },
            [
                h(
                    'div',
                    { staticClass: 'col' },
                    [
                        buildFormSelect(vm, h, {
                            validationTranslator: buildVuelidateTranslator(this.$ilingo),
                            options: groupOptions,
                            propName: 'group_virtual_path',
                            title: [
                                'Group',
                                vm.isVirtualGroupPathDefined ?
                                    h('i', { staticClass: 'fa fa-check text-success ml-1' }) :
                                    h(''),
                            ],
                            changeCallback(value) {
                                vm.setGroup.call(null, value);
                            },
                        }),
                    ],
                ),
                masterImages,
            ],
        );
    },
});
