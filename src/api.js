import parse from "parse-link-header";

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
const getJsonWithLinkHeaders = (url = "", ...fetchOptions) =>
    fetch(url, {
        ...fetchOptions,
        headers: new Headers({
            Authorization: `Client-ID ${config.accessKey}`
        })
    }).then(response => {
        let parsedLinks;
        try {
           parsedLinks = parse(response.headers.get("link")) || {}; 
        } catch (error) {
           parsedLinks = {}; 
        }
        return Promise.all([response.json(), Promise.resolve(parsedLinks)])
    });

export const searchPhotos = (params = {}) => getJsonWithLinkHeaders(generateUrl(`/search/photos`, params));
export const getNextPhotos = (url = "") => url ? getJsonWithLinkHeaders(url) : Promise.all([Promise.resolve({}), Promise.resolve({})]);
