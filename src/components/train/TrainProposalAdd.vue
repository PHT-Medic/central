<script>
	import StationService from "../../modules/StationService";
	import MasterImageService from "../../modules/MasterImageService";

	export default {
		data(){
			return {
				formData: {
					title: "",
					requestedData: "",
                    stationIds: [],
                    masterImageId: "",
                    riskId: "",
                    riskComment: ""
				},

                stations: [],
                stationsLoading: false,

                masterImages: [],
                masterImagesLoading: false,

                risks: [
                    {id: 'low', name: '(Low) Niedriges Risiko'},
                    {id: 'mid', name: '(Mid) Mittleres Risiko'},
                    {id: 'high', name: '(High) Hohes Risiko'}
                ]
			}
		},
        created() {
			this.stationsLoading = true;
			StationService.getStations().then((result) => {
                this.stations = result;
				this.stationsLoading = false;
			});

			this.masterImagesLoading = true;
			MasterImageService.getMasterImages().then((result) => {
                this.masterImages = result;
                this.masterImagesLoading = false;
            });
		}
	}
</script>
<template>
    <div class="text-left">
        <h4 class="title">Antrag - Erstellen</h4>
        <form>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Titel</label>
                        <input type="text" v-model="formData.title" class="form-control" placeholder="...">
                        <div class="alert alert-info m-t-20">
                            Bitte geben Sie einen Titel für den Zug an.
                        </div>
                    </div>
                    <hr>
                    <div class="form-group">
                        <label>Master Image</label>
                        <select class="form-control" v-model="formData.masterImageId" v-bind:disabled="masterImagesLoading">
                            <option value="">--Auswählen--</option>
                            <option v-for="(item,key) in masterImages" v-bind:key="key" v-bind:value="item.id">{{item.name}}</option>
                        </select>
                        <div class="alert alert-info m-t-20">
                            Bitte wählen Sie ein Master Image aus, welches als Grundlage für ihren Entrypoint den Sie beim Starten der
                            Data-Discovery und Data-Analysis jeweils angeben könenn, zugrunde liegt.
                        </div>
                    </div>
                    <hr>
                    <div class="form-group">
                        <label>Risiko</label>
                        <select class="form-control" v-model="formData.riskId">
                            <option value="">--Auswählen--</option>
                            <option v-for="(item,key) in risks" v-bind:key="key" v-bind:value="item.id">{{item.name}}</option>
                        </select>
                        <div class="alert alert-info m-t-20">
                            Bitte wählen Sie eine der Möglichkeiten aus, die am besten beschreibt, wie hoch das Risiko für die Krankenhäuser einzuschätzen ist.
                        </div>
                    </div>
                    <hr>
                    <div class="form-group">
                        <label>Risiko Bewertung</label>
                        <textarea v-model="formData.riskComment" class="form-control" placeholder="..." rows="6"></textarea>
                        <div class="alert alert-info m-t-20">
                            Bitte beschreiben Sie in wenigen Worten, wie Sie das Risiko für die Krankenhäuser bewerten würden.
                        </div>
                    </div>
                    <hr>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary btn-sm">Absenden</button>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Krankenhäuser</label>
                        <select class="form-control" v-model="formData.stationIds" multiple v-bind:disabled="stationsLoading">
                            <option value="">--Auswählen--</option>
                            <option v-for="(item,key) in stations" v-bind:key="key" v-bind:value="item.id">{{item.name}}</option>
                        </select>
                        <div class="alert alert-info m-t-20">
                            Bitte wählen Sie eines oder mehere Krankenhäuser aus, auf denen Sie ihre Data-Discovery und Data-Analysis betreiben möchten.
                        </div>
                    </div>
                    <hr>
                    <div class="form-group">
                        <label>Angeforderte Daten/Parameter</label>
                        <textarea v-model="formData.requestedData" class="form-control" placeholder="..." rows="6"></textarea>
                        <div class="alert alert-info m-t-20">
                            Bitte beschreiben Sie in wenigen Worten welche Daten beziehungsweise Parameter Sie in den Krankenhäusern erheben möchten.
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>