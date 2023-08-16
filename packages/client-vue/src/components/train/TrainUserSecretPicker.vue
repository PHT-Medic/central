<script lang="ts">
import { storeToRefs } from '@authup/client-vue';
import type { Train } from '@personalhealthtrain/core';
import { SecretType } from '@personalhealthtrain/core';
import { defineComponent, toRefs } from 'vue';
import { injectAPIClient, injectAuthupStore } from '../../core';
import UserSecretList from '../user-secret/UserSecretList';

export default defineComponent({
    components: { UserSecretList },
    props: {
        trainId: {
            type: String,
            required: true,
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
    setup(props, { emit }) {
        const apiClient = injectAPIClient();
        const refs = toRefs(props);

        const store = injectAuthupStore();
        const { userId } = storeToRefs(store);

        const payload : Partial<Train> = {};

        const set = async (type: `${SecretType}`, value: string | null) => {
            switch (type) {
                case SecretType.RSA_PUBLIC_KEY: {
                    payload.user_rsa_secret_id = value as string;
                    break;
                }
                case SecretType.PAILLIER_PUBLIC_KEY: {
                    payload.user_paillier_secret_id = value as string;
                    break;
                }
            }

            await apiClient.train.update(refs.trainId.value, payload);

            emit('updated', payload);
        };

        return {
            userId,
            secretType: SecretType,
            set,
        };
    },
});
</script>
<template>
    <div class="row">
        <div class="col">
            <UserSecretList
                ref="itemsList"
                :header-title="false"
                :query="{filters: {user_id: userId}, sort: {created_at: 'DESC'}}"
            >
                <template #itemActions="props">
                    <div class="d-flex flex-row">
                        <template v-if="props.data.id === userRsaSecretId || props.data.id === userPaillierSecretId">
                            <button
                                type="button"
                                class="btn btn-xs btn-warning"
                                @click.prevent="set(props.data.type, null)"
                            >
                                <i class="fa fa-minus" />
                            </button>
                        </template>
                        <template v-else>
                            <button
                                type="button"
                                class="btn btn-xs btn-dark"
                                @click.prevent="set(props.data.type, props.data.id)"
                            >
                                <i class="fa fa-plus" />
                            </button>
                        </template>
                    </div>
                </template>
            </UserSecretList>
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
