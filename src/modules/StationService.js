import {ApiService} from "./ApiService";

const StationService = {
	getStations: async () => {
		const response = await ApiService.get('stations');
		return response.data;
	},
};

export default StationService;