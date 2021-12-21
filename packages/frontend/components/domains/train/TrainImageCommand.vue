<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>
import { getAPIMasterImage, getAPIMasterImageGroups, getApiTrainFile } from '@personalhealthtrain/ui-common';

export default {
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
                const item = await getAPIMasterImage(this.masterImageId);
                const { data } = await getAPIMasterImageGroups({
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

            this.masterImage.busy = true;
        },
        setMasterImage(item) {
            this.masterImage.item = item;
        },
        async loadTrainFile() {
            if (this.trainFile.busy || !this.trainFileId || !this.trainId) return;

            this.trainFile.busy = true;

            try {
                this.trainFile.item = await getApiTrainFile(this.trainId, this.trainFileId);

                this.trainFile.loaded = true;
            } catch (e) {
                console.log(e);
                // ...
            }

            this.trainFile.busy = true;
        },
        setTrainFile(item) {
            this.trainFile.item = item;
        },
    },
};
</script>
<template>
    <div class="command-box">
        <strong class="pr-1 shell-sign">$</strong> {{ commandStr }} {{ fileStr }}
    </div>
</template>
<style>
.command-box {
    background-color: rgb(43, 43, 43);
    border: 1px solid #dedede;
    /* box-shadow: 0 4px 25px 0 rgb(0 0 0 / 10%); */
    transition: all .3s ease-in-out;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    display: flex;
    flex-direction: row;
    color: rgb(184, 186, 160);
}

.command-box .shell-sign {
    color: rgb(166, 89, 45);
}
</style>
