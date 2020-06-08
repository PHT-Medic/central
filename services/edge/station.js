import ResourceApiService from '../api/resourceApi'

const StationService = {
    getStations: async () => {
        const response = await ResourceApiService.get('stations');
        return response.data
    }
}

export default StationService
