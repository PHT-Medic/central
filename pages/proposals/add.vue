<script>
    import { required, minLength, maxLength, integer, alpha } from 'vuelidate/lib/validators';

    import MasterImageService from '../../services/edge/masterImage';
    import StationService from '../../services/edge/station';
    import ProposalEdge from '../../services/edge/proposal/proposalEdge';
    import ProposalFormTitle from "../../components/form/proposal/ProposalFormTitle";

    export default {
        components: {ProposalFormTitle},
        meta: {
            requiresAuth: true
        },
        data () {
            return {
                formData: {
                    title: '',
                    requestedData: '',
                    stationIds: [],
                    masterImageId: '',
                    riskId: '',
                    riskComment: ''
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
                title: {
                    required,
                    minLength: minLength(5),
                    maxLength: maxLength(100)
                },
                requestedData: {
                    required,
                    minLength: minLength(10),
                    maxLength: maxLength(2048)
                },
                stationIds: {
                    required,
                    minLength: minLength(1),
                    $each: {
                        required,
                        integer
                    }
                },
                masterImageId: {
                    required,
                    integer
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
        created () {
            this.stationsLoading = true;
            StationService.getStations().then((result) => {
                this.stations = result;
                this.stationsLoading = false
            });

            this.masterImagesLoading = true;
            MasterImageService.getMasterImages().then((result) => {
                this.masterImages = result;
                this.masterImagesLoading = false
            });
        },
        methods: {
            setTestData () {
                this.formData = {
                    title: 'Das ist ein Beispiel Titel',
                    requestedData: 'Ich möchte alles und noch mehr...',
                    stationIds: [],
                    masterImageId: '',
                    riskId: this.risks[0].id,
                    riskComment: 'Es wird schon nichts passieren.'
                };

                if (this.stations.length > 0) {
                    this.formData.stationIds = [this.stations[0].id]
                }
                if (this.masterImages.length > 0) {
                    this.formData.masterImageId = this.masterImages[0].id
                }
            },
            async handleSubmit (e) {
                e.preventDefault();

                if(this.busy || this.$v.$invalid) {
                    return;
                }

                this.busy = true;

                try {
                    const proposal = await ProposalEdge.addProposal({
                        title: this.formData.title,
                        requested_data: this.formData.requestedData,
                        risk_comment: this.formData.riskComment,
                        risk: this.formData.riskId,
                        master_image_id: this.formData.masterImageId,
                        station_ids: this.formData.stationIds
                    });

                    await this.$nuxt.$router.push('/proposals/' + proposal.id);
                } catch (e) {
                    this.errorMessage = e.response.data.error.message;
                }

                this.busy = false;
            }
        }
    }
</script>
<template>
    <div class="text-left">
        <div class="m-b-10">
            <h4 class="title">
                Antrag <span class="sub-title">Erstellen</span>
            </h4>
        </div>
        <div class="panel-card">
            <div class="panel-card-body">
                <div v-if="errorMessage !== ''" class="alert alert-danger alert-sm">{{ errorMessage }}</div>
                <form>
                    <div class="row">
                        <div class="col-md-6">
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
                                <button type="submit" class="btn btn-outline-primary btn-sm" :disabled="$v.$invalid || busy" @click="handleSubmit">
                                    Absenden
                                </button>

                                <button type="button" class="btn btn-outline-dark btn-sm m-l-20" @click="setTestData">
                                    Test Data
                                </button>
                            </div>

                        </div>
                        <div class="col-md-6">

                            <div class="form-group" :class="{ 'form-group-error': $v.formData.stationIds.$anyError }">
                                <label>Krankenhäuser</label>
                                <select v-model="$v.formData.stationIds.$model" class="form-control" multiple :disabled="stationsLoading">
                                    <option v-for="(item,key) in stations" :key="key" :value="item.id">
                                        {{ item.name }}
                                    </option>
                                </select>
                                <div v-if="!$v.formData.stationIds.required" class="form-group-hint group-required">
                                    Bitte wählen Sie eines oder mehere Krankenhäuser aus, auf denen Sie ihre Data-Discovery und Data-Analysis betreiben möchten.
                                </div>
                                <div v-if="!$v.formData.stationIds.minLength" class="form-group-hint">
                                    Es muss mindestens <strong>{{ $v.formData.stationIds.$params.minLength.min }}</strong> Krankenhaus/er ausgewählt werden.
                                </div>
                            </div>

                            <hr>

                            <div class="form-group" :class="{ 'form-group-error': $v.formData.requestedData.$error }">
                                <label>Angeforderte Daten/Parameter</label>
                                <textarea v-model="$v.formData.requestedData.$model" class="form-control" placeholder="..." rows="6" />

                                <div v-if="!$v.formData.requestedData.required" class="form-group-hint group-required">
                                    Bitte beschreiben Sie in wenigen Worten welche Daten beziehungsweise Parameter Sie in den Krankenhäusern erheben möchten.
                                </div>
                                <div v-if="!$v.formData.requestedData.minLength" class="form-group-hint group-required">
                                    Der Titel für den Antrag muss mindestens <strong>{{ $v.formData.requestedData.$params.minLength.min }}</strong> Zeichen lang sein.
                                </div>
                                <div v-if="!$v.formData.requestedData.maxLength" class="form-group-hint group-required">
                                    Der Titel für den Antrag darf maximal <strong>{{ $v.formData.requestedData.$params.maxLength.max }}</strong> Zeichen lang sein.
                                </div>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
