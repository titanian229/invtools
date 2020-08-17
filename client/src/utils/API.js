export default {
    getSearch: (searchString) => {
        return fetch(`/api/items/${searchString}`).then((result) => result.json());
    },
    getNSSDR: () => {
        return fetch('/api/nssdr').then((result) => result.json());
    },
    getTSA: () => {
        return fetch('/api/tsa').then((result) => result.json());
    },
    getReport: () => {
        return fetch('/api/invRectification').then((result) => result.json());
    },
};
