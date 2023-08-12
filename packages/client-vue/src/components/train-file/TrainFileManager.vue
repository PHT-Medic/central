<script lang="ts">
import type {
    Train, TrainFile,
} from '@personalhealthtrain/central-common';
import {
    hasOwnProperty,
} from '@personalhealthtrain/central-common';
import { BFormCheckbox } from 'bootstrap-vue-next';
import { isClientErrorWithStatusCode } from 'hapic';
import type { PropType } from 'vue';
import {
    computed, defineComponent, reactive, ref, toRefs, watch,
} from 'vue';
import type { BuildInput } from 'rapiq';
import { injectAPIClient, wrapFnWithBusyState } from '../../core';
import TrainFileNode from './TrainFile.vue';
import TrainFileList from './TrainFileList';
import TrainFormFile from './TrainFormFile.vue';
import TrainImageCommand from '../train/TrainImageCommand';

export default defineComponent({
    components: {
        BFormCheckbox,
        TrainFileList,
        TrainImageCommand,
        TrainFormFile,
        TrainFileNode,
    },
    props: {
        entity: {
            type: Object as PropType<Train>,
            required: true,
        },
    },
    emits: ['created', 'updated', 'deleted', 'uploaded', 'failed', 'setEntrypointFile'],
    setup(props, { emit }) {
        const refs = toRefs(props);

        const form = reactive({
            entrypoint_file_id: '',
            path: '',
            files: [],
        });

        const selected = ref([]);
        const selectAll = ref(false);
        const directoryMode = ref(true);
        const busy = ref(false);
        const entryPointFile = ref<null | TrainFile>(null);

        const paths = computed(() => form.path.split('/').filter((el) => el !== ''));

        const initFromProperties = () => {
            if (refs.entity.value.entrypoint_file_id) {
                form.entrypoint_file_id = refs.entity.value.entrypoint_file_id;
            }
        };

        initFromProperties();

        const updatedAt = computed(() => (refs.entity.value ?
            refs.entity.value.updated_at :
            undefined));

        watch(updatedAt, (val, oldValue) => {
            if (val && val !== oldValue) {
                initFromProperties();
            }
        });

        const fileListNode = ref<null | typeof TrainFileList>(null);
        const fileListQuery = computed<BuildInput<TrainFile>>(() => ({
            filters: {
                train_id: refs.entity.value.id,
            },
        }));

        const handleCreated = (entity: TrainFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleCreated(entity);
            }

            emit('created', entity);
        };
        const handleDeleted = (entity: TrainFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleDeleted(entity);
            }

            const selectedIndex = selected.value.indexOf(entity.id);
            if (selectedIndex !== -1) {
                selected.value.splice(selectedIndex, 1);
            }

            emit('deleted', entity);
        };

        const handleUpdated = (entity: TrainFile) => {
            if (fileListNode.value) {
                fileListNode.value.handleUpdated(entity);
            }

            emit('updated', entity);
        };

        const upload = wrapFnWithBusyState(busy, async () => {
            if (form.files.length === 0) return;

            try {
                const formData = new FormData();
                formData.set('train_id', refs.entity.value.id);

                for (let i = 0; i < form.files.length; i++) {
                    formData.append(`files[${i}]`, form.files[i]);
                }

                form.files = [];

                const response = await injectAPIClient().trainFile.upload(formData);
                for (let i = 0; i < response.data.length; i++) {
                    handleCreated(response.data[i]);
                }

                emit('uploaded');
            } catch (e) {
                emit('failed', e);
            }
        });

        const dropSelected = wrapFnWithBusyState(busy, async () => {
            if (selected.value.length === 0) return;

            try {
                for (let i = 0; i < selected.value.length; i++) {
                    const file = await injectAPIClient().trainFile.delete(selected.value[i]);
                    handleDeleted(file);
                }
            } catch (e) {
                if (!isClientErrorWithStatusCode(e, 404)) {
                    emit('failed', e);
                }
            }
        });

        const selectAllFiles = () => {
            if (selectAll.value) {
                if (fileListNode.value) {
                    selected.value = (fileListNode.value.data as unknown as TrainFile[])
                        .map((file) => file.id)
                        .filter((id) => id !== form.entrypoint_file_id);
                }
            } else {
                selected.value = [];
            }
        };

        const toggleFile = (file: TrainFile) => {
            const index = selected.value.findIndex((el) => el === file.id);
            if (index === -1) {
                selected.value.push(file.id);
            } else {
                selected.value.splice(index, 1);
            }
        };

        const filesNode = ref<null | string>(null);

        const checkFormFiles = ($event: any) => {
            $event.preventDefault();

            for (let i = 0; i < $event.target.files.length; i++) {
                form.files.push($event.target.files[i]);
            }

            if (filesNode.value) {
                filesNode.value = '';
            }
        };

        const dropFormFile = ($event: any) => {
            const index = form.files.findIndex((file) => {
                if (
                    hasOwnProperty(file, 'webkitRelativePath') &&
                    hasOwnProperty($event, 'webkitRelativePath')
                ) {
                    return file.webkitRelativePath === $event.webkitRelativePath;
                }
                return file.name === $event.name;
            });

            if (index !== -1) {
                form.files.splice(index, 1);
            }
        };

        const changeEntryPointFile = (file: TrainFile) => {
            if (form.entrypoint_file_id === file.id) {
                form.entrypoint_file_id = null as string;
                entryPointFile.value = null;
            } else {
                form.entrypoint_file_id = file.id;
                entryPointFile.value = file;
            }

            refs.entity.value.entrypoint_file_id = form.entrypoint_file_id;

            // do not allow deletion of entrypoint file.
            if (form.entrypoint_file_id) {
                const index = selected.value.findIndex((file) => file === form.entrypoint_file_id);
                if (index !== -1) {
                    selected.value.splice(index, 1);
                }
            }

            emit('setEntrypointFile', entryPointFile.value);
        };

        return {
            directoryMode,
            busy,
            checkFormFiles,
            paths,
            form,

            selected,
            selectAll,
            dropSelected,
            selectAllFiles,

            dropFormFile,

            upload,

            handleCreated,
            handleDeleted,
            handleUpdated,

            toggleFile,
            changeEntryPointFile,

            filesNode,
            fileListNode,
            fileListQuery,
        };
    },
});
</script>
<template>
    <div>
        <div class="row">
            <div class="col">
                <h6><i class="fa fa-upload" /> Upload</h6>
                <div class="form-group">
                    <label class="form-label">Directories / Files</label>
                    <input
                        id="files"
                        ref="filesNode"
                        type="file"
                        :webkitdirectory="directoryMode"
                        class="form-control"
                        multiple
                        :disbaled="busy"
                        @change="checkFormFiles"
                    >
                </div>
                <div class="form-group">
                    <BFormCheckbox
                        v-model="directoryMode"
                        switch
                    >
                        Directory mode
                    </BFormCheckbox>
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
                    <div class="ms-auto">
                        <h6 class="title text-muted">
                            Path:
                            <span class="sub-title">
                                <template
                                    v-for="(path, key) in paths"
                                    :key="key"
                                >
                                    {{ path }} <span class="text-dark">/</span>
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
                    <template
                        v-for="(file,key) in form.files"
                        :key="key"
                    >
                        <train-form-file
                            class="me-1"
                            :file="file"
                            @drop="dropFormFile"
                        />
                    </template>
                </div>

                <div class="form-group">
                    <button
                        type="button"
                        class="btn btn-xs btn-dark"
                        :disabled="busy || form.files.length === 0"
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
                    class="mt-2 mb-2"
                    :master-image-id="entity.master_image_id"
                    :train-file-id="entity.entrypoint_file_id"
                    :train-id="entity.id"
                />

                <div
                    v-if="!form.entrypoint_file_id"
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

                <TrainFileList
                    ref="fileListNode"
                    :query="fileListQuery"
                    :header-search="false"
                    :header-title="false"
                    :footer-pagination="false"
                    @created="handleCreated"
                    @updated="handleUpdated"
                    @deleted="handleDeleted"
                >
                    <template #body="props">
                        <div class="d-flex flex-column">
                            <template
                                v-for="file in props.data"
                                :key="file.id"
                            >
                                <TrainFileNode
                                    class="me-1"
                                    :entity="file"
                                    :files-selected="selected"
                                    :file-selected-id="form.entrypoint_file_id"
                                    @check="toggleFile"
                                    @updated="props.updated"
                                    @deleted="props.deleted"
                                    @toggle="changeEntryPointFile"
                                />
                            </template>
                        </div>
                    </template>
                </TrainFileList>

                <div class="form-group">
                    <button
                        type="button"
                        class="btn btn-warning btn-xs"
                        :disabled="busy || selected.length === 0"
                        @click.prevent="dropSelected"
                    >
                        <i class="fa fa-trash" /> Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
