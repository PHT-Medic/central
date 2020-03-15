import {ApiService} from "./ApiService";

const Service = {
	getMasterImages: async () => {
		const response = await ApiService.get('master-images');
		return response.data;
	},
};

export default Service;