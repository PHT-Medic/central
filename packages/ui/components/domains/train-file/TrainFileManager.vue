<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    SocketClientToServerEvents,
    SocketServerToClientEvents,
    Train,
    TrainFileSocketClientToServerEventName,
    TrainFileSocketServerToClientEventName,
    buildSocketTrainFileRoomName, hasOwnProperty,
} from '@personalhealthtrain/central-common';
import { required } from 'vuelidate/lib/validators';
import Vue, { PropType } from 'vue';
import { Socket } from 'socket.io-client';
import { REALM_MASTER_NAME } from '@authup/common';
import TrainFile from './TrainFile.vue';
import TrainFormFile from './TrainFormFile.vue';
import TrainImageCommand from '../train/TrainImageCommand';

export default {
    components: { TrainImageCommand, TrainFormFile, TrainFile },
    props: {
        train: {
            type: Object as PropType<Train>,
            default: undefined,
        },
    },
    data() {
        return {
            items: [],
            meta: {
                limit: 10,
                offset: 0,
                total: 0,
            },
            busy: false,

            socketLocked: false,

            selected: [],
            selectAll: false,
            directoryMode: true,

            actionBusy: false,
            formInfo: {
                filesSyncing: false,
            },
            form: {
                entrypoint_file_id: undefined,
                path: '',
                files: [],
            },

            entryPointFile: null,
        };
    },
    computed: {
        paths() {
            return this.form.path.split('/').filter((el) => el !== '');
        },
        entrypointFileId() {
            if (!this.form.entrypoint_file_id) {
                return '';
            }

            const index = this.items.findIndex((file) => file.id === this.form.entrypoint_file_id);
            if (index === -1) {
                return '';
            }

            return `${this.items[index].directory}/${this.items[index].name}`;
        },
        socketRealmId() {
            if (this.realmId) {
                return this.realmId;
            }

            if (this.$store.getters['auth/realmName'] === REALM_MASTER_NAME) {
                return undefined;
            }

            if (this.train.realm_id) {
                return this.train.realm_id;
            }

            return this.$store.getters['auth/realmId'];
        },

        updatedAt() {
            return this.train?.updated_at ? this.train.updated_at : undefined;
        },
    },
    watch: {
        updatedAt(val, oldVal) {
            if (val && val !== oldVal) {
                this.initFromProperties();
            }
        },
    },
    created() {
        this.initFromProperties();

        Promise.resolve()
            .then(this.load);
    },
    mounted() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        socket.emit(TrainFileSocketClientToServerEventName.SUBSCRIBE);
        socket.on(TrainFileSocketServerToClientEventName.CREATED, this.handleSocketCreated);
    },
    beforeDestroy() {
        const socket : Socket<
        SocketServerToClientEvents,
        SocketClientToServerEvents
        > = this.$socket.useRealmWorkspace(this.socketRealmId);

        socket.emit(TrainFileSocketClientToServerEventName.UNSUBSCRIBE);
        socket.off(TrainFileSocketServerToClientEventName.CREATED, this.handleSocketCreated);
    },
    methods: {
        initFromProperties() {
            if (!this.train) return;

            if (!!this.train.entrypoint_file_id && this.train.entrypoint_file_id.length > 0) {
                this.form.entrypoint_file_id = this.train.entrypoint_file_id;
            }
        },
        handleSocketCreated(context) {
            if (
                this.socketLocked ||
                context.meta.roomName !== buildSocketTrainFileRoomName() ||
                context.data.train_id !== this.train.id
            ) return;

            this.handleCreated(context.data);
        },
        handleCreated(item, withCheck = true) {
            let exists = false;
            if (withCheck) {
                const index = this.items.findIndex((el) => el.id === item.id);
                exists = index !== -1;
            }

            if (!exists) {
                this.items.push(item);

                if (this.items.length > this.meta.limit) {
                    this.items.splice(this.meta.limit, 1);
                }

                this.meta.total++;

                this.$emit('created', item);
            }
        },
        handleUpdated(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                const keys = Object.keys(item);
                for (let i = 0; i < keys.length; i++) {
                    Vue.set(this.items[index], keys[i], item[keys[i]]);
                }
            }

            this.$emit('updated', item);
        },
        handleDeleted(item) {
            const index = this.items.findIndex((el) => el.id === item.id);
            if (index !== -1) {
                if (this.form.entrypoint_file_id === this.items[index].id) {
                    this.changeEntryPointFile(this.items[index]);
                }

                this.items.splice(index, 1);
                this.meta.total--;

                this.$emit('deleted', item);
            }

            const selectedIndex = this.selected.indexOf(item.id);
            if (selectedIndex !== -1) {
                this.selected.splice(selectedIndex, 1);
            }
        },
        async load() {
            if (this.busy) return;

            this.busy = true;

            try {
                const response = await this.$api.trainFile.getMany({ train_id: this.train.id });
                this.items = response.data;
            } catch (e) {
                // ...
            }

            this.busy = false;
        },
        async upload() {
            if (this.actionBusy) return;

            if (this.form.files.length === 0) return;

            this.actionBusy = true;

            try {
                const formData = new FormData();
                formData.set('train_id', this.train.id);

                for (let i = 0; i < this.form.files.length; i++) {
                    formData.append(`files[${i}]`, this.form.files[i]);
                }

                this.socketLocked = true;
                const response = await this.$api.trainFile.upload(formData);
                response.data.map((item) => this.handleCreated(item, false));
                this.socketLocked = false;

                this.$emit('uploaded', this.form.files);
                this.form.files = [];
            } catch (e) {
                this.socketLocked = false;
                this.$emit('failed', e.message);
            }

            this.actionBusy = false;
        },

        //----------------------------------------------------------------

        async dropSelected() {
            if (this.actionBusy) return;

            if (this.selected.length === 0) return;

            this.actionBusy = true;

            try {
                for (let i = 0; i < this.selected.length; i++) {
                    const file = await this.$api.trainFile.delete(this.selected[i]);
                    this.handleDeleted(file);
                }
            } catch (e) {
                // ...
            }

            this.actionBusy = false;
        },
        selectAllFiles() {
            if (this.selectAll) {
                this.selected = this.items.map((file) => file.id).filter((id) => id !== this.form.entrypoint_file_id);
            } else {
                this.selected = [];
            }
        },
        toggleFile(event) {
            const index = this.selected.findIndex((file) => file === event.id);
            if (index === -1) {
                this.selected.push(event.id);
            } else {
                this.selected.splice(index, 1);
            }
        },

        checkFormFiles(event) {
            event.preventDefault();

            for (let i = 0; i < event.target.files.length; i++) {
                this.form.files.push(event.target.files[i]);
            }

            this.$refs.files.value = '';
        },
        dropFormFile(event) {
            const index = this.form.files.findIndex((file) => {
                if (
                    hasOwnProperty(file, 'webkitRelativePath') &&
                    hasOwnProperty(event, 'webkitRelativePath')
                ) {
                    return file.webkitRelativePath === event.webkitRelativePath;
                }
                return file.name === event.name;
            });

            if (index !== -1) {
                this.form.files.splice(index, 1);
            }
        },

        changeEntryPointFile(file) {
            if (this.form.entrypoint_file_id === file.id) {
                this.form.entrypoint_file_id = undefined;
                this.entryPointFile = null;
            } else {
                this.form.entrypoint_file_id = file.id;
                this.entryPointFile = file;
            }

            this.$refs.imageCommand.setTrainFile(this.entryPointFile);

            // do not allow deletion of entrypoint file.
            if (this.form.entrypoint_file_id) {
                const index = this.selected.findIndex((file) => file === this.form.entrypoint_file_id);
                if (index !== -1) {
                    this.selected.splice(index, 1);
                }
            }

            this.$emit('setEntrypointFile', this.entryPointFile);
        },

        getParentPath(path) {
            if (path === '/') return '';

            const parts = path.split('/').filter((el) => el !== '');
            parts.pop();

            return parts.join('/');
        },
    },
    validations() {
        return {
            form: {
                entrypoint_executable: {
                    required,
                },
            },
        };
    },
};
</script>
<template>
    <div>
        <div class="row">
            <div class="col">
                <h6><i class="fa fa-upload" /> Upload</h6>
                <div class="form-group">
                    <label>Directories / Files</label>
                    <div class="custom-file">
                        <input
                            id="files"
                            ref="files"
                            type="file"
                            :webkitdirectory="directoryMode"
                            class="custom-file-input"
                            multiple
                            :disbaled="actionBusy"
                            @change="checkFormFiles"
                        >
                        <label
                            class="custom-file-label"
                            for="files"
                        >Select files...</label>
                    </div>
                </div>
                <div class="form-group">
                    <b-form-checkbox
                        v-model="directoryMode"
                        switch
                    >
                        Directory mode
                    </b-form-checkbox>
                </div>

                <hr>

                <div class="d-flex flex-row">
                    <div>
                        <h6 class="title text-muted">
                            Files
                            <span style="font-size: 0.65rem">
                                <span class="text-info">
                                    <i class="fa fa-memory" /> in Memory
                                </span>
                            </span>
                        </h6>
                    </div>
                    <div class="ml-auto">
                        <h6 class="title text-muted">
                            Path:
                            <span class="sub-title">
                                <template v-for="(path, key) in paths">
                                    {{ path }} <span
                                        :key="key"
                                        class="text-dark"
                                    >/</span>
                                </template>
                                <template v-if="paths.length === 0">
                                    [root]
                                </template>
                            </span>
                        </h6>
                    </div>
                </div>

                <div
                    v-if="form.files.length === 0"
                    class="alert alert-info alert-sm m-t-10"
                >
                    You have not selected any files to upload...
                </div>

                <div class="d-flex flex-column">
                    <train-form-file
                        v-for="(file,key) in form.files"
                        :key="key"
                        class="mr-1"
                        :file="file"
                        @drop="dropFormFile"
                    />
                </div>

                <div class="form-group">
                    <button
                        type="button"
                        class="btn btn-xs btn-dark"
                        :disabled="actionBusy || form.files.length === 0"
                        @click.prevent="upload"
                    >
                        Upload
                    </button>
                </div>
            </div>
            <div class="col">
                <h6><i class="fa fa-bars" /> Manage</h6>

                <span>Entrypoint Command</span>
                <br>
                <train-image-command
                    ref="imageCommand"
                    class="mt-2 mb-2"
                    :master-image-id="train.master_image_id"
                    :train-file-id="train.entrypoint_file_id"
                    :train-id="train.id"
                />

                <div
                    v-if="!entrypointFileId"
                    class="alert alert-warning alert-sm mb-0"
                >
                    A file from the list below must be selected as entrypoint for the image command.
                </div>

                <hr>

                <h6 class="title text-muted">
                    Files
                    <span style="font-size: 0.65rem">
                        <span class="text-success">
                            <i class="fa fa-file" /> uploaded
                        </span>
                    </span>
                </h6>

                <div
                    class="form-check"
                >
                    <input
                        id="selectAllFiles"
                        v-model="selectAll"
                        type="checkbox"
                        class="form-check-input"
                        @change="selectAllFiles"
                    >
                    <label for="selectAllFiles">Select all</label>
                </div>

                <div class="d-flex flex-column">
                    <template v-for="file in items">
                        <train-file
                            :key="file.id"
                            class="mr-1"
                            :file="file"
                            :files-selected="selected"
                            :file-selected-id="form.entrypoint_file_id"
                            @check="toggleFile"
                            @updated="handleUpdated"
                            @deleted="handleDeleted"
                            @toggle="changeEntryPointFile"
                        />
                    </template>
                </div>

                <div class="form-group">
                    <button
                        type="button"
                        class="btn btn-warning btn-xs"
                        :disabled="actionBusy || selected.length === 0"
                        @click.prevent="dropSelected"
                    >
                        <i class="fa fa-trash" /> Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
