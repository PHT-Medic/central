<script>
import {getApiTrainFiles, dropApiTrainFile, uploadTrainFiles} from "@/domains/train/file/index.ts";

export default {
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
            actionBusy: false,
            formInfo: {
                filesSyncing: false
            },
            form: {
                files: []
            }
        }
    },
    created() {
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
        async drop(id) {
            if(this.actionBusy) return;

            const index = this.items.findIndex(item => item.id === id);
            if(index === -1) return;

            this.actionBusy = true;

            try {
                await dropApiTrainFile(this.train.id, id);
                this.items.splice(index, 1);
            } catch (e) {

            }

            this.actionBusy = false;
        },
        async upload() {
            if(this.actionBusy) return;

            if(this.form.files.length === 0) return;

            this.actionBusy = true;

            try {
                let formData = new FormData();
                for(let i=0; i<this.form.files.length; i++) {
                    formData.append('files['+i+']', this.form.files[i]);
                }

                const files = await uploadTrainFiles(this.train.id, formData);

                this.$refs.files.value = '';
                this.form.files = [];

                for(let i=0; i<files.length; i++) {
                    this.items.push(files[i]);
                }

                this.$emit('uploaded', files);
            } catch (e) {
                this.$emit('failed', e.message);
            }

            this.actionBusy = false;
        },

        checkFormFiles(event) {
            event.preventDefault();

            for(let i=0; i < event.target.files.length; i++) {
                let file = event.target.files[i];

                this.form.files.push(file);
            }
        },
        dropFormFile(key) {
            this.form.files.splice(key, 1);
        }
    }
}
</script>
<template>
    <div class="form-group">
        <label>EntryPoint Dateien</label>
        <div class="custom-file">
            <input type="file" webkitdirectory class="custom-file-input" id="files" ref="files" @change="checkFormFiles" multiple :disbaled="actionBusy">
            <label class="custom-file-label" for="files">Dateien auswählen...</label>
        </div>

        <div v-if="form.files.length === 0 && items.length === 0" class="alert alert-warning alert-sm m-t-10">
            Es muss ein Entrypoint bzw Dateien hochgeladen werden.
        </div>

        <div class="flex flex-row flex-wrap m-t-10">
            <button @click.prevent="drop(item.id)" v-for="(item,key) in items" :key="key" class="btn btn-dark btn-xs rounded" style="margin: 0 5px 5px 0;">
                {{item.name}}
            </button>
            <button @click.prevent="dropFormFile(key)" v-for="(item,key) in form.files" :key="key" class="btn btn-primary btn-xs rounded" style="margin: 0 5px 5px 0;">
                {{item.name}} ({{item.size}} Bytes)
            </button>
        </div>

        <div class="form-group">
            <button type="button" class="btn btn-xs btn-primary" :disabled="actionBusy || form.files.length === 0">
                Hochladen
            </button>
        </div>
    </div>
</template>
