import {ApiService} from "../ApiService";

const TrainStationService = {
	getStations: async () => {
		const response = await ApiService.get('train/stations');
		return response.data;
	},
};

export default TrainStationService;