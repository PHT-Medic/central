const StorageService = {
    set(key,value) {
        if (process.server) { return }

        localStorage.setItem(key, value)
    },
    drop(key) {
        if (process.server) { return }

        localStorage.removeItem(key)
    },
    get(key) {
        if(process.server) return null;

        return localStorage.getItem(key);
    },

    //-----------------------------------

    setJson(key,value) {
        if (process.server) { return }

        value = JSON.stringify(value)
        this.set(key, value)
    },
    dropJson(key) {
        if (process.server) { return }

        this.drop(key);
    },
    getJson(key) {
        if (process.server) { return null }

        const data = this.get(key);
        if (data !== null) {
            return JSON.parse(data);
        }

        return data;
    }
}

export default StorageService;
