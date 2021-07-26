<script>
    import { required, minLength, maxLength, integer, alpha } from 'vuelidate/lib/validators';

    import ProposalFormTitle from "../../../components/form/proposal/ProposalFormTitle";
    import {getStations} from "@/domains/station/api.ts";
    import {getMasterImages} from "@/domains/masterImage/api.ts";
    import {addProposal} from "@/domains/proposal/api.ts";

    export default {
        components: {ProposalFormTitle},
        meta: {
            requireLoggedIn: true,
            requireAbility: (can) => {
                return can('add', 'proposal');
            }
        },
        data () {
            return {
                formData: {
                    title: '',
                    requestedData: '',
                    stationIds: [],
                    masterImageId: '',
                    risk: '',
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
                risk: {
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
            getStations().then((response) => {
                this.stations = response.data;
                this.stationsLoading = false
            });

            this.masterImagesLoading = true;
            getMasterImages().then((data) => {
                this.masterImages = data.data;
                this.masterImagesLoading = false
            });
        },
        methods: {
            setTestData () {
                this.formData = {
                    title: 'Das ist ein Beispiel Titel',
                    requestedData: 'Ich möchte alles und noch mehr...',
                    stationIds: this.stations.map(item => item.id),
                    masterImageId: '',
                    risk: this.risks[0].id,
                    riskComment: 'Es wird schon nichts passieren.'
                };

                console.log(this.stations.map(item => item.id));

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
                    const proposal = await addProposal(this.formData);

                    await this.$nuxt.$router.push('/proposals/' + proposal.id);
                } catch (e) {
                    this.errorMessage = e.message;
                }

                this.busy = false;
            }
        }
    }
</script>
<template>
    <div>
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

                    <div class="form-group" :class="{ 'form-group-error': $v.formData.risk.$error }">
                        <label>Risiko</label>
                        <select v-model="$v.formData.risk.$model" class="form-control">
                            <option value="">
                                --Auswählen--
                            </option>
                            <option v-for="(item,key) in risks" :key="key" :value="item.id">
                                {{ item.name }}
                            </option>
                        </select>
                        <div v-if="!$v.formData.risk.required" class="form-group-hint group-required">
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
                        <select v-model="$v.formData.stationIds.$model" class="form-control" style="height:100px;" multiple :disabled="stationsLoading">
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
</template>
