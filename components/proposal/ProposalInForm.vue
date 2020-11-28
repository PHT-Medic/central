<script>
import {maxLength, minLength, required, email} from "vuelidate/lib/validators";

import AlertMessage from "@/components/alert/AlertMessage";
import {
    ProposalStationStateApproved,
    ProposalStationStateOpen,
    ProposalStationStateRejected
} from "@/domains/proposal/station";
import {editApiStationProposal} from "@/domains/station/proposal/api.ts";

const states = [
    {
        id: ProposalStationStateOpen,
        name: 'Offen'
    },
    {
        id: ProposalStationStateApproved,
        name: 'Annehmen'
    },
    {
        id: ProposalStationStateRejected,
        name: 'Ablehnen'
    }
];


export default {
    components: {AlertMessage},
    props: {
        proposalStationProperty: {
            type: Object,
            default: {}
        }
    },
    data() {
        return {
            formData: {
                comment: '',
                status: ''
            },

            status: {
                items: states
            },

            busy: false,
            message: null
        }
    },
    validations: {
        formData: {
            comment: {
                required,
                minLength: minLength(5),
                maxLength: maxLength(2048)
            },
            status: {
                required
            }
        }
    },
    created() {
        this.formData.status = this.proposalStationProperty.status ?? '';
        this.formData.comment = this.proposalStationProperty.comment ?? '';
    },
    methods: {
        async handleSubmit () {
            if (this.busy || this.$v.$invalid) {
                return;
            }

            this.message = null;
            this.busy = true;

            try {
                if(this.isEditing) {
                    const stationProposal = await editApiStationProposal(this.proposalStationProperty.proposal.id, this.proposalStationProperty.id, this.formData);

                    this.message = {
                        isError: false,
                        data: 'Der Antrag wurde erfolgreich editiert.'
                    }

                    this.$emit('updated', stationProposal);
                }
            } catch (e) {
                this.message = {
                    data: e.message,
                    isError: true
                }
            }

            this.busy = false;
        }
    },
    computed: {
        isEditing() {
            return this.modeProperty !== 'add';
        }
    }
}
</script>
<template>
    <div>
        <alert-message :message="message" />

        <div>
            <div class="form-group" :class="{ 'form-group-error': $v.formData.comment.$error }">
                <label>Kommentar</label>
                <textarea
                    rows="10"
                    v-model="$v.formData.comment.$model"
                    type="text" name="name"
                    class="form-control"
                    placeholder="Schreiben Sie ein Kommentar, warum Sie den Antrag annehmen oder ablehnen..."
                >
                </textarea>

                <div v-if="!$v.formData.comment.required && !$v.formData.comment.$model" class="form-group-hint group-required">
                    Bitte geben Sie einen Kommentar an.
                </div>
                <div v-if="!$v.formData.comment.minLength" class="form-group-hint group-required">
                    Der Kommentar muss mindestens <strong>{{ $v.formData.comment.$params.minLength.min }}</strong> Zeichen lang sein.
                </div>
                <div v-if="!$v.formData.comment.maxLength" class="form-group-hint group-required">
                    Der Kommentar darf maximal <strong>{{ $v.formData.comment.$params.maxLength.max }}</strong> Zeichen lang sein.
                </div>
            </div>

            <div class="form-group" :class="{ 'form-group-error': $v.formData.status.$error }">
                <label>Status</label>
                <select
                    v-model="$v.formData.status.$model"
                    class="form-control"
                >
                    <option value="">--- Bitte auswählen ---</option>
                    <option v-for="(item,key) in status.items" :value="item.id" :key="key">{{ item.name }}</option>
                </select>

                <div v-if="!$v.formData.status.required && !$v.formData.status.$model" class="form-group-hint group-required">
                    Bitte geben Sie einen Status an.
                </div>
            </div>

            <hr>

            <div class="form-group">
                <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click.prevent="handleSubmit">
                    {{ isEditing ? 'Aktualisieren' : 'Erstellen' }}
                </button>
            </div>
        </div>
    </div>
</template>
<style>
.list-group-item {
    padding: .45rem .65rem;
}
</style>
