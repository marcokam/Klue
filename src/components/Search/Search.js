import React, { useEffect, useState, useMemo, useCallback, createRef } from "react";
import { useParams } from "react-router-dom";
import { debounce, once } from "lodash-es";

import { searchPhotos, getNextPhotos, apiStates } from "../../api";
import { PhotoGrid } from "../Photos/PhotosGrid";

export function Search({ pageSize = 30 }) {
    const searchInputRef = createRef();
    const { searchTerm: initialSearchTerm = "" } = useParams();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const dbSetSearchTerm = useMemo(() => debounce(setSearchTerm, 200), []);
    const [photos, setPhotos] = useState([]);
    const [query, setQuery] = useState({ apiState: apiStates.none, data: {}, links: {} });
    const handleSearch = useCallback(
        event => {
            const searchTerm = (event && event.target && event.target.value) || "";
            dbSetSearchTerm(searchTerm);
        },
        [dbSetSearchTerm]
    );
    const getNext = useCallback(once(() => {
        const nextLink = query.links.next;
        if (nextLink && nextLink.url) {
            getNextPhotos(nextLink.url)
                .then(([payload = {}, links = {}] = []) => {
                    const { results = [], ...data } = payload;
                    setQuery({ apiState: apiStates.fetched, data, links });
                    setPhotos(prevPhotos => {
                        console.log('prevPhotos', prevPhotos);
                        return prevPhotos.concat(results);
                        // return prevPhotos.push(...results)
                    });
                })
                .catch(error => {
                    setQuery(prev => ({ ...prev, apiState: apiStates.error, error }));
                });
        }
    }), [query.links.next]);

    useEffect(() => {
       if (searchInputRef.current) {
           searchInputRef.current.focus();
       } 
    }, [searchInputRef]);
    useEffect(() => {
        if (!searchTerm) {
            setQuery(prev => ({ ...prev, data: {} }));
            setPhotos([]);
            return;
        }

        let cancelled = false;
        setQuery(prev => ({ ...prev, apiState: apiStates.fetching }));
        setPhotos([]);
        searchPhotos({ query: searchTerm, per_page: pageSize })
            .then(([payload = {}, links = {}] = []) => {
                if (cancelled) return;
                const { results = [], ...data } = payload;
                setQuery({ apiState: apiStates.fetched, data, links });
                setPhotos(results);
            })
            .catch(error => {
                if (cancelled) return;
                setQuery(prev => ({ ...prev, apiState: apiStates.error, error }));
            });

        return () => {
            cancelled = true;
        };
    }, [pageSize, searchTerm]);

    console.log("query", query);

    return (
        <div className="w-100 flex flex-column items-center">
            <div
                className="w-100 h3 flex items-center absolute bg-black-70 pv2 ph4 shadow-5 z-1"
                style={{ top: 0, position: "sticky" }}
            >
                <img
                    className="h2"
                    src="https://klue.com/wp-content/themes/klue/assets-home2/img/logo-klue.svg"
                    alt="Klue logo"
                />
                <input
                    ref={searchInputRef}
                    className="input-reset ml3 pa2 br2 ba b--black-20 w5"
                    defaultValue={searchTerm}
                    placeholder="Search for a Photo"
                    onChange={handleSearch}
                />
            </div>
            <div className="w-100 mw9 mv4 ph6">
                {query.apiState !== apiStates.fetching && (
                    photos.length > 0 ? (
                        <div key={searchTerm}>
                            <PhotoGrid
                                photos={photos}
                                query={query}
                                getNext={getNext}
                            />
                        </div>
                    ) : query.apiState === apiStates.none || searchTerm === "" ? (
                        <h1>Enter some text to search for photos</h1>
                    ) : (
                        <h1>We counldn't find any photos matching "{searchTerm}"</h1>
                    )
                )}
            </div>
        </div>
    );
}
