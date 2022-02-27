<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script>

import { SecretType } from '@personalhealthtrain/central-common';
import UserSecretList from '../user-secret/UserSecretList';

export default {
    name: 'TrainUserSecretPicker',
    components: { UserSecretList },
    props: {
        trainId: {
            type: String,
            default: undefined,
        },
        userRsaSecretId: {
            type: String,
            default: undefined,
        },
        userPaillierSecretId: {
            type: String,
            default: undefined,
        },
    },
    data() {
        return {
            loading: false,

            secretType: SecretType,

            userSecret: {
                items: [],
                busy: false,
            },
        };
    },
    computed: {
        userId() {
            return this.$store.getters['auth/userId'];
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

    },
    methods: {
        async init() {
            if (!this.userRsaSecretId && !this.userPaillierSecretId) return;

            this.loading = true;

            try {
                const { meta } = await this.$api.userSecret.getMany({
                    filter: {
                        id: [
                            ...(this.userRsaSecretId ? [this.userRsaSecretId] : []),
                            ...(this.userPaillierSecretId ? [this.userPaillierSecretId] : []),
                        ],
                    },
                });
            } catch (e) {
                // ...
            }

            this.loading = false;
        },
        async toggle(type, item) {
            switch (type) {
                case SecretType.RSA_PUBLIC_KEY: {
                    const response = await this.$api.train.update(this.trainId, {
                        user_rsa_secret_id: this.userRsaSecretId === item.id ? null : item.id,
                    });

                    this.$emit('updated', response);
                    break;
                }
                case SecretType.PAILLIER_PUBLIC_KEY: {
                    const response = await this.$api.train.update(this.trainId, {
                        user_paillier_secret_id: this.userPaillierSecretId === item.id ? null : item.id,
                    });

                    this.$emit('updated', response);
                    break;
                }
            }
        },
    },
};
</script>
<template>
    <div class="row">
        <div class="col">
            <div class="d-flex flex-column">
                <div class="form-group">
                    <label>RSA SecretID</label>
                    <input
                        :value="userRsaSecretId"
                        type="text"
                        class="form-control"
                        :disabled="true"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    >
                </div>
                <div class="form-group">
                    <label>Paillier SecretID</label>
                    <input
                        :value="userPaillierSecretId"
                        type="text"
                        class="form-control"
                        :disabled="true"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    >
                </div>
            </div>
        </div>

        <div class="col">
            <user-secret-list
                ref="itemsList"
                :query="{filter: {user_id: userId}, sort: {created_at: 'DESC'}}"
            >
                <template #item-actions="{item}">
                    <div class="d-flex flex-row">
                        <template v-if="item.id === userRsaSecretId || item.id === userPaillierSecretId">
                            <button
                                type="button"
                                class="btn btn-xs btn-warning"
                                @click.prevent="toggle(item.type, item)"
                            >
                                <i class="fa fa-minus" />
                            </button>
                        </template>
                        <template v-else>
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                @click.prevent="toggle(item.type, item)"
                            >
                                <i class="fa fa-plus" />
                            </button>
                        </template>
                    </div>
                </template>
            </user-secret-list>
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
