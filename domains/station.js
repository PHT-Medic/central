import ResourceApiService from '../services/api/resourceApi'

const StationService = {
    getStations: async () => {
        const response = await ResourceApiService.get('stations');
        return response.data
    }
}

export default StationService
