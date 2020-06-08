<script>
    import ProposalEditor from '../../../layouts/proposal/ProposalEditor';
    import {alpha, integer, maxLength, minLength, required} from "vuelidate/lib/validators";
    import MasterImageService from "../../../services/edge/masterImage";
    import {ProposalStationStates} from "../../../services/edge/proposal/proposalStationEdge";

    export default {
        components: { ProposalEditor },
        props: {
            proposal: {
                type: Object,
                default () {
                    return {};
                }
            },
            proposalStations: {
                type: Array,
                default () {
                    return [];
                }
            }
        },
        data () {
            return {
                proposalStationStates: ProposalStationStates,

                formData: {
                    masterImageId: this.proposal.master_image_id,
                    title: this.proposal.title,
                    riskId: this.proposal.risk,
                    riskComment: this.proposal.risk_comment
                },

                busy: false,
                errorMessage: '',

                stations: [],
                stationsLoading: false,

                masterImages: [],
                masterImagesLoading: false,

                risks: [
                    { id: 'low', name: '(Low) Niedriges Risiko' },
                    { id: 'mid', name: '(Mid) Mittleres Risiko' },
                    { id: 'high', name: '(High) Hohes Risiko' }
                ]
            }
        },
        validations: {
            formData: {
                masterImageId: {
                    required,
                    integer
                },
                title: {
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(100)
                },
                riskId: {
                    required,
                    alpha
                },
                riskComment: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(2048)
                }
            }
        },
        created() {
            this.masterImagesLoading = true;
            MasterImageService.getMasterImages().then((result) => {
                this.masterImages = result;
                this.masterImagesLoading = false
            });
        },
        methods: {
            submitDetails (e) {
                try {
                    /*
                    const data = await ProposalService.editProposal(this.proposal.id, {
                      title: e.title,
                      requested_data: e.requestedData,
                      risk_comment: e.riskComment,
                      risk: e.riskId,
                      master_image_id: e.masterImageId,
                      station_ids: e.stationIds
                    });
                     */

                    this.$emit('set-proposal', {
                        title: e.title,
                        requested_data: e.requestedData,
                        risk_comment: e.riskComment,
                        risk_id: e.riskId,
                        station_ids: e.stationIds,
                        master_image_id: e.masterImageId
                    });

                    return this.proposal.id;
                } catch (e) {
                    throw new Error(e.response.data.error.message);
                }
            }
        }
    }
</script>
<template>
    <div>
        <div class="row">
            <div class="col-6">
                <div class="panel-card">
                    <div class="panel-card-header">
                        <h6 class="title">
                            Details
                        </h6>
                    </div>
                    <div class="panel-card-body">
                        <div class="form-group" :class="{ 'form-group-error': $v.formData.title.$error }">
                            <label>Titel</label>
                            <input v-model="$v.formData.title.$model" type="text" class="form-control" placeholder="...">

                            <div v-if="!$v.formData.title.required" class="form-group-hint group-required">
                                Bitte geben Sie einen Titel für den Zug an.
                            </div>
                            <div v-if="!$v.formData.title.minLength" class="form-group-hint group-required">
                                Der Titel für den Antrag muss mindestens <strong>{{ $v.formData.title.$params.minLength.min }}</strong> Zeichen lang sein.
                            </div>
                            <div v-if="!$v.formData.title.maxLength" class="form-group-hint group-required">
                                Der Titel für den Antrag darf maximal <strong>{{ $v.formData.title.$params.maxLength.max }}</strong> Zeichen lang sein.
                            </div>
                        </div>

                        <hr>

                        <div class="form-group" :class="{ 'form-group-error': $v.formData.masterImageId.$error }">
                            <label>Master Image</label>
                            <select v-model="$v.formData.masterImageId.$model" class="form-control" :disabled="masterImagesLoading">
                                <option value="">
                                    --Auswählen--
                                </option>
                                <option v-for="(item,key) in masterImages" :key="key" :value="item.id">
                                    {{ item.name }}
                                </option>
                            </select>

                            <div v-if="!$v.formData.masterImageId.required" class="form-group-hint group-required">
                                Bitte wählen Sie ein Master Image aus, welches als Grundlage für ihren Entrypoint den Sie beim Starten der
                                Data-Discovery und Data-Analysis jeweils angeben könenn, zugrunde liegt.
                            </div>
                        </div>

                        <hr>

                        <div class="form-group" :class="{ 'form-group-error': $v.formData.riskId.$error }">
                            <label>Risiko</label>
                            <select v-model="$v.formData.riskId.$model" class="form-control">
                                <option value="">
                                    --Auswählen--
                                </option>
                                <option v-for="(item,key) in risks" :key="key" :value="item.id">
                                    {{ item.name }}
                                </option>
                            </select>
                            <div v-if="!$v.formData.riskId.required" class="form-group-hint group-required">
                                Bitte wählen Sie eine der Möglichkeiten aus, die am besten beschreibt, wie hoch das Risiko für die Krankenhäuser einzuschätzen ist.
                            </div>
                        </div>

                        <hr>

                        <div class="form-group" :class="{ 'form-group-error': $v.formData.riskComment.$error }">
                            <label>Risiko Bewertung</label>
                            <textarea v-model="$v.formData.riskComment.$model" class="form-control" placeholder="..." rows="6" />
                            <div v-if="!$v.formData.riskComment.required" class="form-group-hint group-required">
                                Bitte beschreiben Sie in wenigen Worten, wie Sie das Risiko für die Krankenhäuser bewerten würden.
                            </div>
                            <div v-if="!$v.formData.riskComment.minLength" class="form-group-hint group-required">
                                Die Risiko Bewertung muss mindestens <strong>{{ $v.formData.riskComment.$params.minLength.min }}</strong> Zeichen lang sein.
                            </div>
                            <div v-if="!$v.formData.riskComment.maxLength" class="form-group-hint group-required">
                                Die Risiko Bewertung darf maximal <strong>{{ $v.formData.riskComment.$params.maxLength.max }}</strong> Zeichen lang sein.
                            </div>
                        </div>

                        <hr>

                        <div class="form-group">
                            <button type="submit" class="btn btn-primary btn-sm" :disabled="$v.$invalid" @click="submitDetails">
                                <i class="fa fa-save"></i> Speichern
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-6">
                <div class="panel-card">
                    <div class="panel-card-header flex flex-row">
                        <h6 class="title">
                            Stationen: <span class="text-primary">{{proposalStations.length}}</span>
                        </h6>
                        <!--
                        <div style="margin-left: auto;">
                            <button type="button" class="btn btn-xs btn-success">
                                Hinzufügen
                            </button>
                        </div>
                        -->
                    </div>
                    <div class="panel-card-body">
                        <div class="alert alert-primary alert-sm">
                            Hier können Sie sehen von welchen Stationen, der Antrag bereits akzeptiert, verweigert oder zu Verbesserung angeregt wurde.
                        </div>

                        <b-list-group class="overflow-auto" style="height:500px;">
                            <b-list-group-item v-for="(item,key) in proposalStations" class="flex-column align-items-start" :key="key">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1 font-weight-bold">{{item.name}}</h6>
                                    <div>
                                        <button type="button" class="btn btn-xs btn-danger">
                                            <i class="fa fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <span class="font-weight-bold">Status:</span>
                                        <!--
                                        <span :class="{
                                            'text-info': item.relation.status === proposalStationStates.ProposalStationStateOpen,
                                            'text-danger': item.relation.status === proposalStationStates.ProposalStationStateDeclined,
                                            'text-success': item.relation.status === proposalStationStates.ProposalStationStateAccepted,
                                        }" class="label">{{item.relation.status}}</span>
                                        -->
                                        <span class="label text-success">angenommen</span>
                                    </div>
                                    <div>
                                        <span class="font-weight-bold">Kommentar:</span>
                                        <span v-if="!item.relation.comment">...</span>
                                        <span v-if="item.relation.comment">{{item.relation.comment}}</span>
                                    </div>
                                </div>
                            </b-list-group-item>
                        </b-list-group>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
