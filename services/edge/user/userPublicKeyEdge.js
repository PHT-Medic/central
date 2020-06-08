import ResourceApiService from '../../api/resourceApi';

const UserPublicKeyEdge = {
    getKey: async () => {
        const response = await ResourceApiService.get('/users/publicKey');
        return response.data
    },
    dropKey: async () => {
        const response = await ResourceApiService.delete('/users/publicKey');
        return response.data;
    },
    addKey: async (publicKey) => {
        const response = await ResourceApiService.post('/users/publicKey',{ public_key: publicKey});
        return response.data;
    }
};

export default UserPublicKeyEdge
