<template>
  <div>
    <form>
      <form-wizard
        ref="trainWizard"
        color="#333"
        title="Zug"
        subtitle="Erstellen"
        back-button-text="Zurück"
        next-button-text="Weiter"
        finish-button-text="Ende"
        :start-index="current.index"
      >
        <tab-content title="Type" :before-change="validateCurrentType">
          <b-card no-body>
            <b-tabs pills card vertical>
              <b-tab title="Discovery" :active="!canCreateAnalyseTrain" :disabled="!canCreateDiscoveryTrain" @click="current.trainType = 'discovery'">
                <b-card-text>
                  Starte einen Discovery Zug, um zu erfahren wie viele Daten augrund der angefoderten Parameter in den Krankenhäuser verfügbar sind.
                </b-card-text>
              </b-tab>
              <b-tab title="Analyse" :disabled="!canCreateAnalyseTrain" @click="current.trainType = 'analyse'">
                <b-card-text>
                  Starte einen Analyse auf Basis der zugrunde liegenden Ergebnisse des Discovery Zuges.
                </b-card-text>
              </b-tab>
            </b-tabs>
          </b-card>
        </tab-content>
        <tab-content title="Einstellungen">
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
              Bitte wählen Sie ein Master Image aus, dass diesem Zug zugrunde liegt.
            </div>
          </div>

          <hr>

          <div class="form-group" :class="{ 'form-group-error': $v.formData.stationIds.$anyError }">
            <label>Krankenhäuser</label>
            <select v-model="$v.formData.stationIds.$model" class="form-control" multiple :disabled="stationsLoading">
              <option v-for="(item,key) in stations" :key="key" :value="item.id">
                {{ item.name }}
              </option>
            </select>
            <div v-if="!$v.formData.stationIds.required" class="form-group-hint group-required">
              Bitte wählen Sie eines oder mehere Krankenhäuser aus ihrem Antrag aus.
            </div>
            <div v-if="!$v.formData.stationIds.minLength" class="form-group-hint">
              Es muss mindestens <strong>{{ $v.formData.stationIds.$params.minLength.min }}</strong> Krankenhaus/er ausgewählt werden.
            </div>
          </div>

          <hr>

          <div class="form-group">
            <label>EntryPoint Name</label>
            <input v-model="$v.formData.entryPointName.$model" type="text" class="form-control" placeholder="...">
            <div v-if="!$v.formData.entryPointName.required" class="form-group-hint group-required">
              Bitte geben Sie einen Entrypoint Namen an.
            </div>
            <div v-if="!$v.formData.entryPointName.minLength" class="form-group-hint">
              Der EntryPoint muss mindestens <strong>{{ $v.formData.entryPointName.$params.minLength.min }}</strong> Zeichen lang sein.
            </div>
            <div v-if="!$v.formData.entryPointName.minLength" class="form-group-hint">
              Der EntryPoint darf maximal <strong>{{ $v.formData.entryPointName.$params.minLength.min }}</strong> Zeichen lang sein.
            </div>
          </div>

          <hr>

          <div class="form-group">
            <label>EntryPoint Dateien</label>
            <vue-dropzone id="create-train" :options="dropOptions" />
          </div>
        </tab-content>
        <tab-content title="Hash/Signierung">
          My second tab content
        </tab-content>
        <tab-content title="Ende">
          Yuhuuu! This seems pretty damn simple
        </tab-content>
      </form-wizard>
    </form>
  </div>
</template>
<script>
import { FormWizard, TabContent } from 'vue-form-wizard';

import 'vue-form-wizard/dist/vue-form-wizard.min.css';
import { integer, maxLength, minLength, required } from 'vuelidate/lib/validators';
import MasterImageService from '../../../services/edge/masterImage';
import ProposalApiService from '../../../services/edge/proposal';

export default {
  components: {
    FormWizard,
    TabContent
  },
  props: {
    proposal: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  async asyncData (context) {
    try {
      const { discovery, analyse } = await ProposalApiService.getProposalTrains({ id: context.params.id });

      return {
        discoveryTrain: discovery,
        analyseTrain: analyse
      };
    } catch (e) {
      await context.app.$nuxt.$router.push('/proposals');
    }
  },
  data: () => ({
    current: {
      index: 0,
      trainType: null
    },
    discoveryTrain: null,
    analyseTrain: null,

    masterImages: [],
    masterImagesLoading: false,

    stations: [],
    stationsLoading: false,

    formData: {
      masterImageId: '',
      stationIds: [],
      entryPointName: '',
      entryPointFiles: []
    },
    dropOptions: {
      url: 'https://httpbin.org/post',
      dictDefaultMessage: 'Lege Dateien zum Uploaden hierhin'
    }
  }),
  validations () {
    const validations = {};
    const formData = {};

    formData.masterImageId = {
      required,
      integer
    };

    formData.stationIds = {
      required,
      minLength: minLength(1),
      $each: {
        required,
        integer
      }
    };

    formData.entryPointName = {
      required,
      minLength: minLength(5),
      maxLength: maxLength(50)
    };

    validations.formData = formData;

    return validations;
  },
  computed: {
    canCreateDiscoveryTrain: () => {
      return true;
    },
    canCreateAnalyseTrain () {
      return this.discoveryTrain !== null;
    }
  },
  created () {
    this.formData.masterImageId = this.proposal.master_image_id;

    this.masterImagesLoading = true;
    MasterImageService.getMasterImages().then((result) => {
      this.masterImages = result;
      this.masterImagesLoading = false
    });
  },
  methods: {
    validateCurrentType () {
      return !!this.current.trainType;
    }
  }
}
</script>
