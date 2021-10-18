<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import {dropApiTrainFile, getApiTrainFiles, uploadTrainFiles, Train} from "@personalhealthtrain/ui-common";
import {required} from 'vuelidate/lib/validators';
import TrainFile from "../../../components/train/file/TrainFile";
import TrainFolder from "../../../components/train/file/TrainFolder";
import TrainFormFile from "../../../components/train/file/TrainFormFile";

export default {
    components: {TrainFormFile, TrainFolder, TrainFile},
    props: {
        train: {
            type: Object,
            default: undefined
        }
    },
    data() {
        return {
            items: [],
            busy: false,

            selected: [],
            selectAll: false,
            directoryMode: true,

            actionBusy: false,
            formInfo: {
                filesSyncing: false
            },
            form: {
                entrypoint_file_id: undefined,
                entrypoint_executable: '',
                path: '',
                files: []
            },
            executableOptions: [
                {id: 'python', name: 'Python'},
                {id: 'r', name: 'R'}
            ]
        }
    },
    created() {
        if(typeof this.train.entrypoint_executable !== 'undefined' && this.train.entrypoint_executable) {
            this.form.entrypoint_executable = this.train.entrypoint_executable;
        }

        if(typeof this.train.entrypoint_file_id !== 'undefined') {
            this.form.entrypoint_file_id = this.train.entrypoint_file_id;
        }

        this.load().then(r => r);
    },
    methods: {
        async load() {
            if(this.busy) return;

            this.busy = true;

            try {
                this.items = await getApiTrainFiles(this.train.id);
            } catch (e) {

            }

            this.busy = false;
        },
        async upload() {
            if(this.actionBusy) return;

            if(this.form.files.length === 0) return;

            this.actionBusy = true;

            try {
                let formData = new FormData();
                for(let i=0; i<this.form.files.length; i++) {
                    console.log(this.form.files[i]);
                    formData.append('files['+i+']', this.form.files[i]);
                }

                const response = await uploadTrainFiles(this.train.id, formData);
                this.form.files = [];

                for(let i=0; i<response.data.length; i++) {
                    this.items.push(response.data[i]);
                }

                this.$emit('uploaded', files);
            } catch (e) {
                console.log(e);
                this.$emit('failed', e.message);
            }

            this.actionBusy = false;
        },

        //----------------------------------------------------------------

        async dropSelected() {
            if(this.actionBusy) return;

            if(this.selected.length === 0) return;

            this.actionBusy = true;

            try {
                for(let i=0; i<this.selected.length; i++) {
                    await dropApiTrainFile(this.train.id, this.selected[i]);

                    const index = this.items.findIndex(file => file.id === this.selected[i]);
                    if(index !== -1) {
                        this.items.splice(index, 1);
                    }

                    this.$emit('deleted', this.selected[i]);
                }
            } catch (e) {

            }

            this.actionBusy = false;
        },
        selectAllFiles() {
            if(this.selectAll) {
                this.selected = this.items.map(file => file.id).filter(id => id !== this.form.entrypoint_file_id);
            } else {
                this.selected = [];
            }
        },
        selectFile(event) {
            const index = this.selected.findIndex(file => file === event.id);
            if(index === -1) {
                this.selected.push(event.id);
            } else {
                this.selected.splice(index, 1);
            }
        },

        checkFormFiles(event) {
            event.preventDefault();

            for(let i=0; i < event.target.files.length; i++) {
                this.form.files.push(event.target.files[i]);
            }

            this.$refs.files.value = '';
        },
        dropFormFile(event) {
            const index = this.form.files.findIndex(file => {
                if(
                    file.hasOwnProperty('webkitRelativePath') &&
                    event.hasOwnProperty('webkitRelativePath')
                ) {
                    return file.webkitRelativePath === event.webkitRelativePath;
                } else {
                    return file.name === event.name;
                }
            });

            if(index !== -1) {
                this.form.files.splice(index, 1);
            }
        },
        handleFileDeleted(id) {
            const index = this.items.findIndex(file => file.id === id);
            if(index !== -1) {
                this.items.splice(index, 1);
            }

            this.$emit('deleted', id);
        },

        changeEntryPointFile(file) {
            if(!this.form.entrypoint_file_id) {
                this.form.entrypoint_file_id = file.id;
            } else {
                if(this.form.entrypoint_file_id === file.id) {
                    this.form.entrypoint_file_id = undefined;
                } else {
                    this.form.entrypoint_file_id = file.id;
                }
            }

            if(this.form.entrypoint_file_id) {
                const index = this.selected.findIndex(file => file === this.form.entrypoint_file_id);
                if(index !== -1) {
                    this.selected.splice(index, 1);
                }
            }

            this.$emit('setEntrypointFile', this.form.entrypoint_file_id);
        },
        changeEntryPointExecutable() {
            this.$emit('setEntrypointExecutable', this.form.entrypoint_executable);
        },

        getParentPath(path) {
            if(path === '/') return '';

            let parts = path.split('/').filter(el => el !== '');
            parts.pop();

            return parts.join('/');
        }
    },
    validations() {
        return {
            form: {
                entrypoint_executable: {
                    required
                }
            }
        }
    },
    computed: {
        paths() {
            return this.form.path.split('/').filter(el => el !== '');
        },
        entrypoint_file_id() {
            if(!this.form.entrypoint_file_id) {
                return '';
            }

            const index = this.items.findIndex(file => file.id === this.form.entrypoint_file_id);
            if(index === -1) {
                return '';
            }

            return this.items[index].directory + '/' + this.items[index].name;
        }
    }
}
</script>
<template>
    <div>
        <div class="row">

            <div class="col">
                <div class="form-group">
                    <label>Directories / Files</label>
                    <div class="custom-file">
                        <input type="file" :webkitdirectory="directoryMode" class="custom-file-input" id="files" ref="files" @change="checkFormFiles" multiple :disbaled="actionBusy">
                        <label class="custom-file-label" for="files">Select files...</label>
                    </div>
                </div>
                <div class="form-group">
                    <b-form-checkbox switch v-model="directoryMode">Directory mode</b-form-checkbox>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label>EntryPoint Executable</label>
                    <select class="form-control" v-model="$v.form.entrypoint_executable.$model" @change="changeEntryPointExecutable">
                        <option value="">--- Select an option ---</option>
                        <option v-for="(option,key) in executableOptions" :key="key" :value="option.id">
                            {{option.name}}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Entrypoint File</label>
                    <input type="text" class="form-control" :value="entrypoint_file_id" :disabled="true" placeholder="Please toggle a file in the file list, to be selected as entrypoint file">
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="d-flex flex-row">
                    <div>
                        <h6 class="title text-muted">Files
                            <span style="font-size: 0.65rem">
                                <span class="text-info">
                                    <i class="fa fa-file-upload"></i> not uploaded
                                </span>
                            </span>
                        </h6>
                    </div>
                    <div class="ml-auto">
                        <h6 class="title text-muted">Path:
                            <span class="sub-title">
                                <template v-for="(path, key) in paths">
                                     {{path}} <span class="text-dark" :key="key">/</span>
                                </template>
                                <template v-if="paths.length === 0">
                                    [root]
                                </template>
                            </span>
                        </h6>
                    </div>
                </div>

                <div v-if="form.files.length === 0" class="alert alert-info alert-sm m-t-10">
                    You have not selected any files to upload...
                </div>

                <div class="d-flex flex-column">
                    <train-form-file
                        class="mr-1"
                        v-for="(file,key) in form.files"
                        :key="key"
                        :file="file"
                        @drop="dropFormFile"
                    />
                </div>

                <div class="form-group">
                    <button type="button" class="btn btn-xs btn-dark" :disabled="actionBusy || form.files.length === 0" @click.prevent="upload">
                        Upload
                    </button>
                </div>
            </div>

            <div class="col">
                <h6 class="title text-muted">Files
                    <span style="font-size: 0.65rem">
                                <span class="text-success">
                                    <i class="fa fa-file"></i> uploaded
                                </span>
                            </span>
                </h6>


                <div class="form-check">
                    <input type="checkbox" v-model="selectAll" @change="selectAllFiles" class="form-check-input" id="selectAllFiles">
                    <label for="selectAllFiles">Select all</label>
                </div>

                <div class="d-flex flex-column">
                    <train-file
                        class="mr-1"
                        v-for="(file,key) in items"
                        :key="key"
                        :file="file"
                        :files-selected="selected"
                        :file-selected-id="form.entrypoint_file_id"
                        @check="selectFile"
                        @toggle="changeEntryPointFile"
                    />
                </div>

                <div class="form-group">
                    <button type="button" class="btn btn-warning btn-xs" :disabled="actionBusy || selected.length === 0" @click.prevent="dropSelected">
                        Delete
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>
<style>
.file-man-box {
    padding: 8px;
    border: 1px solid #e3eaef;
    border-radius: 5px;
    position: relative;
}

.file-man-box .file-close {
    color: #f1556c;
    line-height: 24px;
    font-size: 24px;
    right: 10px;
    top: 10px;
}

.file-man-box .file-img-box {
    text-align: center;
}

.file-man-box .file-img-box img {
    height: 32px;
}

.file-man-box .file-img-box i {
    font-size: 32px;
}

.file-man-box .file-download {
    font-size: 32px;
    color: #98a6ad;
}

.file-man-box .file-man-title {
    padding-right: 25px;
}
</style>
