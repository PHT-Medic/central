<script>
import { alpha, integer, maxLength, minLength, required } from 'vuelidate/lib/validators';
import MasterImageService from '../../services/edge/masterImage';
import StationService from '../../services/edge/station';

export default {
  name: 'ProposalEditor',
  props: {
    with: { type: Array, default () { return []; } },
    submit: { type: Function, default () { return data => null; } },
    data: {
      type: Object,
      default () {
        return {
          title: '',
          requestedData: '',
          stationIds: [],
          masterImageId: '',
          riskId: '',
          riskComment: ''
        };
      }
    }
  },
  data () {
    return {
      formData: this.data,
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
  validations () {
    const validations = {};
    const formData = {};

    if (this.with.includes('title')) {
      formData.title = {
        required,
        minLength: minLength(5),
        maxLength: maxLength(100)
      };
    }

    if (this.with.includes('requestedData')) {
      formData.requestedData = {
        required,
        minLength: minLength(10),
        maxLength: maxLength(2048)
      };
    }

    if (this.with.includes('stations')) {
      formData.stationIds = {
        required,
        minLength: minLength(1),
        $each: {
          required,
          integer
        }
      };
    }

    if (this.with.includes('masterImage')) {
      formData.masterImageId = {
        required,
        integer
      };
    }

    if (this.with.includes('risk')) {
      formData.riskId = {
        required,
        alpha
      };
    }

    if (this.with.includes('riskComment')) {
      formData.riskComment = {
        required,
        minLength: minLength(5),
        maxLength: maxLength(100)
      };
    }

    validations.formData = formData;

    return validations;
  },
  created () {
    if (this.with.includes('stations')) {
      this.stationsLoading = true;
      StationService.getStations().then((result) => {
        this.stations = result;
        this.stationsLoading = false
      });
    }

    if (this.with.includes('masterImage')) {
      this.masterImagesLoading = true;
      MasterImageService.getMasterImages().then((result) => {
        this.masterImages = result;
        this.masterImagesLoading = false
      });
    }
  },
  methods: {
    async handleSubmit (e) {
      e.preventDefault();

      this.busy = true;

      try {
        const proposalId = await this.submit(this.formData);
        console.log(proposalId);
      } catch (e) {
        console.log(e);
      }

      this.busy = false;
    },
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
    }
  }
}
</script>

<template>
  <div>
    <form>
      <div class="row">
        <div class="col-md-6">

          <div v-if="this.with.includes('title')" class="form-group" :class="{ 'form-group-error': $v.formData.title.$error }">
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

          <div v-if="this.with.includes('masterImage')" class="form-group" :class="{ 'form-group-error': $v.formData.masterImageId.$error }">
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

          <div v-if="this.with.includes('risk')" class="form-group" :class="{ 'form-group-error': $v.formData.riskId.$error }">
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

          <div v-if="this.with.includes('riskComment')" class="form-group" :class="{ 'form-group-error': $v.formData.riskComment.$error }">
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

          <div v-if="this.with.includes('stations')" class="form-group" :class="{ 'form-group-error': $v.formData.stationIds.$anyError }">
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

          <div v-if="this.with.includes('requestedData')" class="form-group" :class="{ 'form-group-error': $v.formData.requestedData.$error }">
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
