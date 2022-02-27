<!--
  Copyright (c) 2021-2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
export default {
    props: {
        file: {
            type: Object,
            default: undefined,
        },
        filesSelected: {
            type: Array,
            default: () => [],
        },
        fileSelectedId: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            busy: false,
        };
    },
    computed: {
        path() {
            return `${this.file.directory}/${this.file.name}`;
        },
        marked() {
            return this.filesSelected.findIndex((file) => file === this.file.id) !== -1;
        },
        isMatch() {
            return this.fileSelectedId === this.file.id;
        },
    },
    mounted() {
        const socket = this.$socket.useRealmWorkspace(this.file.realm_id);
        socket.emit('trainFilesSubscribe', { data: { id: this.file.id } });

        socket.on('trainFileUpdated', this.handleSocketUpdated);
        socket.on('trainFileDeleted', this.handleSocketDeleted);
    },
    beforeDestroy() {
        const socket = this.$socket.useRealmWorkspace(this.file.realm_id);
        socket.emit('trainFilesUnsubscribe', { data: { id: this.file.id } });
        socket.off('trainFileUpdated', this.handleSocketUpdated);
        socket.off('trainFileDeleted', this.handleSocketDeleted);
    },
    methods: {
        toggle() {
            this.$emit('toggle', this.file);
        },
        markToggle() {
            this.$emit('check', {
                ...this.file,
            });
        },
        handleSocketUpdated(context) {
            if (
                this.file.id !== context.data.id ||
                context.meta.roomId !== this.file.id
            ) return;

            this.handleUpdated(context.data);
        },
        handleSocketDeleted(context) {
            if (
                this.file.id !== context.data.id ||
                context.meta.roomId !== this.file.id
            ) return;

            this.handleDeleted({ ...context.data });
        },
        handleUpdated(entity) {
            this.$emit('updated', entity);
        },
        handleDeleted(entity) {
            this.$emit('deleted', entity);
        },

        async drop() {
            if (this.busy) return;

            this.busy = true;

            try {
                const file = await this.$api.trainFile.delete(this.file.train_id, this.file.id);
                this.handleDeleted(file);
            } catch (e) {
                this.$emit('failed', e);
            }

            this.busy = false;
        },
    },
};
</script>
<template>
    <div
        class="card card-file d-flex flex-row align-items-center p-1"
        :class="{'checked': marked}"
    >
        <div
            class="card-heading align-items-center d-flex flex-row"
            @click.prevent="markToggle"
        >
            <span class="title">
                {{ path }}
                <small class="text-muted ml-1">{{ file.size }} Bytes</small>
            </span>
        </div>
        <div class="ml-auto d-flex flex-row mr-1">
            <div>
                <button
                    v-if="!fileSelectedId || isMatch"
                    type="button"
                    class="btn btn-xs"
                    :class="{
                        'btn-success': !isMatch,
                        'btn-warning': isMatch
                    }"
                    @click.prevent="toggle"
                >
                    <i
                        :class="{
                            'fa fa-check': !isMatch,
                            'fa fa-times': isMatch
                        }"
                    />
                </button>
            </div>
            <div class="ml-1">
                <button
                    type="button"
                    class="btn btn-danger btn-xs"
                    :disabled="busy"
                    @click.prevent="drop"
                >
                    <i class="fa fa-trash" />
                </button>
            </div>
        </div>
    </div>
</template>
