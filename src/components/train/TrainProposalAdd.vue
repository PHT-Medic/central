<script>
	import TrainStationService from "../../modules/train/TrainStationService";

	export default {
		data(){
			return {
				formData: {
					test: "",
					test2: "",
                    station_id: null
				},
                stations: [],
                stationsLoading: false
			}
		},
        created() {
			this.stationsLoading = true;
			let stations = TrainStationService.getStations();
			stations.then((result) => {
                this.stations = result;
				this.stationsLoading = false;
			});
		}
	}
</script>
<template>
    <div class="text-left">
        <h4 class="title">Antrag - Erstellen</h4>
        <form>
            <div class="form-group">
                <label>Platzhalter</label>
                <input type="text" v-model="formData.test" class="form-control">
            </div>

            <div class="form-group">
                <label>Platzhalter</label>
                <input type="text" v-model="formData.test2" class="form-control">
            </div>
            <div class="form-group">
                <label>Station(en)</label>
                <select class="form-control" v-model="formData.station_id" multiple v-bind:disabled="stationsLoading">
                    <option value="">--Auswählen--</option>
                    <option v-for="(item,key) in stations" v-bind:key="key" v-bind:value="item.id">{{item.name}}</option>
                </select>
            </div>

            {{formData}}}
        </form>
    </div>
</template>