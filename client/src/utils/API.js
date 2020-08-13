export default {
    getSearch: (searchString) => {
        return fetch(`/api/items/${searchString}`).then((result) => result.json());
    },
};
