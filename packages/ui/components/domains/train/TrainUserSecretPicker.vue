<!--
  Copyright (c) 2021.
  Author Peter Placzek (tada5hi)
  For the full copyright and license information,
  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { Train } from '@personalhealthtrain/central-common';
import { SecretType } from '@personalhealthtrain/central-common';
import { UserSecretList } from '../user-secret/UserSecretList';

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
    methods: {
        async set(type, value) {
            const payload : Partial<Train> = {};

            switch (type) {
                case SecretType.RSA_PUBLIC_KEY: {
                    payload.user_rsa_secret_id = value;
                    break;
                }
                case SecretType.PAILLIER_PUBLIC_KEY: {
                    payload.user_paillier_secret_id = value;
                    break;
                }
            }

            await this.$api.train.update(this.trainId, payload);

            this.$emit('updated', payload);
        },
    },
};
</script>
<template>
    <div class="row">
        <div class="col">
            <user-secret-list
                ref="itemsList"
                :with-header="false"
                :query="{filter: {user_id: userId}, sort: {created_at: 'DESC'}}"
            >
                <template #item-actions="{item}">
                    <div class="d-flex flex-row">
                        <template v-if="item.id === userRsaSecretId || item.id === userPaillierSecretId">
                            <button
                                type="button"
                                class="btn btn-xs btn-warning"
                                @click.prevent="set(item.type, null)"
                            >
                                <i class="fa fa-minus" />
                            </button>
                        </template>
                        <template v-else>
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                @click.prevent="set(item.type, item.id)"
                            >
                                <i class="fa fa-plus" />
                            </button>
                        </template>
                    </div>
                </template>
            </user-secret-list>
        </div>
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
    </div>
</template>
