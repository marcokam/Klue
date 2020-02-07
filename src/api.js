export const apiStates = {
    none: "none",
    fetching: "fetching",
    fetched: "fetched",
    error: "error"
};
const config = {
    base: "https://api.unsplash.com",
    accessKey: "ddbc8bef70e3b2fb1400468c8bbb99bce0e9fac17b2861b0e7415455e2699da0"
};
const formatQuery = (params = {}) =>
    Object.entries(params)
        .map(([key, val]) => `${key}=${val}`)
        .join("&");
const generateUrl = (uri, params = {}) => {
    const queryParams = formatQuery(params);
    return `${config.base}${uri}${queryParams ? `?${queryParams}` : ""}`;
};
const getJson = (uri = "", params = {}, ...options) =>
    fetch(generateUrl(uri, params), {
        ...options,
        headers: new Headers({
            Authorization: `Client-ID ${config.accessKey}`
        })
    }).then(response => response.json());


export const searchPhotos = (params = {}) => getJson(`/search/photos`, params);
