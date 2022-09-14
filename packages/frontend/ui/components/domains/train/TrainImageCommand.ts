/*
 * Copyright (c) 2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import Vue, { CreateElement, VNode } from 'vue';

export default Vue.extend({
    props: {
        trainId: {
            type: String,
            default: undefined,
        },
        masterImageId: {
            type: String,
            default: undefined,
        },
        trainFileId: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            masterImage: {
                item: null,
                busy: false,
                loaded: false,
            },
            trainFile: {
                item: null,
                busy: false,
                loaded: false,
            },
        };
    },
    computed: {
        commandStr() {
            const masterImage = this.masterImage.item;

            if (
                masterImage &&
                masterImage.command &&
                !masterImage.command.match(/\//g)
            ) {
                masterImage.command = `/usr/bin/${masterImage.command}`;
            }

            return !masterImage || !masterImage.command ? '<Command>' : masterImage.command;
        },
        fileStr() {
            const { item } = this.trainFile;
            if (!item) {
                return '<File>';
            }

            let fileDirectoryPath = item.directory || '.';
            if (fileDirectoryPath === '.') fileDirectoryPath = './';

            return `${fileDirectoryPath}${item.name}`;
        },
    },
    watch: {
        masterImageId(val, oldVal) {
            if (val && val !== oldVal) {
                this.loadMasterImage();
            }
        },
    },
    created() {
        Promise.resolve()
            .then(this.load);
    },
    methods: {
        async load() {
            await this.loadMasterImage();
            await this.loadTrainFile();
        },
        async loadMasterImage() {
            if (this.masterImage.busy || !this.masterImageId) return;

            this.masterImage.busy = true;

            try {
                const item = await this.$api.masterImage.getOne(this.masterImageId);
                const { data } = await this.$api.masterImageGroup.getMany({
                    filter: {
                        virtual_path: item.group_virtual_path,
                    },
                });

                if (data.length === 1) {
                    item.command = item.command || data[0].command;
                    item.command_arguments = item.command_arguments || data[0].command_arguments;
                }

                this.masterImage.item = item;

                this.masterImage.loaded = true;
            } catch (e) {
                // ...
            }

            this.masterImage.busy = false;
        },
        async loadTrainFile() {
            if (this.trainFile.busy || !this.trainFileId || !this.trainId) return;

            this.trainFile.busy = true;

            try {
                this.trainFile.item = await this.$api.trainFile.getOne(this.trainId, this.trainFileId);

                this.trainFile.loaded = true;
            } catch (e) {
                if (e instanceof Error) {
                    this.$emit('failed', e);
                }
            }

            this.trainFile.busy = false;
        },
        setTrainFile(item) {
            this.trainFile.item = item;
        },
    },
    render(h: CreateElement): VNode {
        const vm = this;

        return h(
            'div',
            { staticClass: 'command-box' },
            [
                h('strong', { staticClass: 'pr-1 shell-sign' }, [
                    '$',
                ]),
                vm.commandStr,
                ' ',
                vm.fileStr,
            ],
        );
    },
});
