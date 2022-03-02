<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>

import { MasterImageList } from './MasterImageList';

export default {
    name: 'MasterImagePicker',
    components: { MasterImageList },
    props: {
        masterImageId: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            loading: false,

            groupVirtualPath: null,

            group: {
                items: [],
                busy: false,
                item: null,
            },
        };
    },
    computed: {
        showImages() {
            return !!this.groupVirtualPath;
        },
        imageQuery() {
            return {
                filters: {
                    ...(this.groupVirtualPath !== '' ? { group_virtual_path: this.groupVirtualPath } : {}),
                },
            };
        },
        isInImageList() {
            if (!this.$refs.itemList || !this.masterImageId) {
                return false;
            }

            const index = this.$refs.itemList.items.findIndex((el) => el.id === this.masterImageId);
            return index !== -1;
        },
    },
    watch: {
        async masterImageId(val, oldVal) {
            if (this.loading) return;

            if (val && val !== oldVal) {
                await this.init();
            }
        },
    },
    created() {
        Promise.resolve()
            .then(this.loadGroups)
            .then(this.init);
    },
    methods: {
        async init() {
            if (!this.masterImageId) return;

            this.loading = true;

            try {
                const data = await this.$api.masterImage.getOne(this.masterImageId);

                await this.selectGroup(data.group_virtual_path);
            } catch (e) {
                // ...
            }

            this.loading = false;
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

        async selectGroupByEvent(event) {
            await this.selectGroup(event.target.value);
        },
        async selectGroup(virtualPath) {
            if (!virtualPath) {
                this.groupVirtualPath = null;
                this.group.item = null;
            } else {
                this.groupVirtualPath = virtualPath;

                const index = this.group.items.findIndex((item) => item.virtual_path === virtualPath);
                this.group.item = index !== -1 ? this.group.items[index] : null;
            }

            if (this.groupVirtualPath && this.$refs.itemList) {
                await this.$refs.itemList.load();
            }
        },

        async selectImageByEvent(event) {
            await this.toggleImage({ id: event.target.value });
        },
        async toggleImage(item) {
            if (!item) {
                this.$emit('selected', null);
            } else {
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

                if (item.id !== this.masterImageId) {
                    this.$emit('selected', item);
                }
            }
        },
    },
};
</script>
<template>
    <div>
        <div class="row">
            <div class="col">
                <label>Group <span
                    v-if="groupVirtualPath"
                    class="ml-1"
                ><i class="fa fa-check text-success" /></span> </label>
                <select
                    :value="groupVirtualPath"
                    class="form-control"
                    :disabled="group.busy"
                    @change.prevent="selectGroupByEvent"
                >
                    <option value="">
                        -- Please select --
                    </option>
                    <option
                        v-for="(item,key) in group.items"
                        :key="key"
                        :value="item.virtual_path"
                    >
                        {{ item.name }}
                    </option>
                </select>
            </div>
            <div
                v-if="showImages"
                class="col"
            >
                <label>Image <span
                    v-if="masterImageId"
                    class="ml-1"
                ><i class="fa fa-check text-success" /></span>
                </label>
                <master-image-list
                    ref="itemList"
                    :with-header="false"
                    :with-search="false"
                    :with-pagination="false"
                    :query="imageQuery"
                >
                    <template #items="{items, busy}">
                        <select
                            :value="masterImageId"
                            class="form-control mb-2"
                            :disabled="busy"
                            @change.prevent="selectImageByEvent"
                        >
                            <option value="">
                                -- Please select --
                            </option>
                            <option
                                v-for="item in items"
                                :key="item.id"
                                :value="item.id"
                                :selected="item.id === masterImageId"
                            >
                                {{ item.name }}
                            </option>
                        </select>
                    </template>
                </master-image-list>
            </div>
        </div>
    </div>
</template>
