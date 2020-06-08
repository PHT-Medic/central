import ResourceApiService from '../api/resourceApi';

const Service = {
    getMasterImages: async () => {
        const response = await ResourceApiService.get('master-images');
        return response.data
    }
};

export default Service
