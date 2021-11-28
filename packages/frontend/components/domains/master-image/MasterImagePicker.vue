<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {
    getAPIMasterImage,
    getAPIMasterImageGroups,
    getAPIMasterImages,
} from '@personalhealthtrain/ui-common';

export default {
    name: 'MasterImagePicker',
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
            imageId: null,

            image: {
                items: [],
                busy: false,
            },
            group: {
                items: [],
                busy: false,
            },
        };
    },
    computed: {
        showImages() {
            return !!this.groupVirtualPath;
        },
    },
    created() {
        Promise.resolve()
            .then(this.loadGroups)
            .then(this.init);
    },
    methods: {
        async init() {
            if (this.masterImageId) {
                this.loading = true;

                console.log(this.masterImageId);

                try {
                    const data = await getAPIMasterImage(this.masterImageId, {
                        relations: {
                            group: true,
                        },
                    });

                    await this.selectGroup(data.group_virtual_path);
                    await this.selectImage(data.id);
                } catch (e) {
                    // ...
                }

                this.loading = false;
            }
        },
        async loadImages() {
            if (this.image.busy) return;

            this.image.busy = true;

            try {
                const { data } = await getAPIMasterImages({
                    filters: {
                        ...(this.groupVirtualPath !== '' ? { group_virtual_path: this.groupVirtualPath } : {}),
                    },
                });

                this.image.items = data;
            } catch (e) {
                // ...
            }

            this.image.busy = false;
        },
        async loadGroups() {
            if (this.group.busy) return;

            this.group.busy = true;

            try {
                const { data } = await getAPIMasterImageGroups();

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
            if (!virtualPath || virtualPath === '') {
                this.image.items = [];
                this.groupVirtualPath = null;
            } else {
                if (this.image.busy) return;
                this.groupVirtualPath = virtualPath;
            }

            await this.selectImage(null);

            // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
            this.groupVirtualPath && await this.loadImages();
        },

        async selectImageByEvent(event) {
            await this.selectImage(event.target.value);
        },
        async selectImage(id) {
            if (!id || id === '') {
                this.image.items = [];
                this.imageId = null;
            } else {
                this.imageId = id;
            }

            this.$emit('selected', this.imageId);
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
                    v-if="imageId"
                    class="ml-1"
                ><i class="fa fa-check text-success" /></span></label>
                <select
                    :value="imageId"
                    class="form-control"
                    :disabled="image.busy"
                    @change.prevent="selectImageByEvent"
                >
                    <option value="">
                        -- Please select --
                    </option>
                    <option
                        v-for="(item,key) in image.items"
                        :key="key"
                        :value="item.id"
                    >
                        {{ item.name }}
                    </option>
                </select>
            </div>
        </div>
    </div>
</template>
<style>
.click-box {
    text-align: center;
    background: #ececec;
    border-radius: 4px;
    padding: 1rem 3rem;
}

.click-box:hover,
.click-box.active {
    color: #FF5B5B;
    background: #32333B;
    cursor: pointer;
}
</style>
