import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { debounce } from "lodash-es";

import { searchPhotos, apiStates } from "../../api";
import { Masonry } from "../Masonry/Masonry";


export function Search({ pageSize = 20 }) {
    const { searchTerm: initialSearchTerm = "" } = useParams();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const dbSetSearchTerm = useMemo(() => debounce(setSearchTerm, 200), []);
    const [searchData, setSearchData] = useState({ apiState: apiStates.none, payload: {} });
    const { results: photos = [] } = searchData.payload;
    const handleSearch = useCallback(event => {
        const searchTerm = (event && event.target && event.target.value) || "";
        dbSetSearchTerm(searchTerm);
    }, [dbSetSearchTerm]);

    useEffect(() => {
        if (!searchTerm) {
            setSearchData(prev => ({ ...prev, payload: {} }));
        };

        let cancelled = false;
        setSearchData(prev => ({ ...prev, apiState: apiStates.fetching }));
        searchPhotos({ query: searchTerm, per_page: pageSize })
            .then((payload = {}) => {
                if (cancelled) return;
                setSearchData({ apiState: apiStates.fetched, payload });
            })
            .catch(err => {
                if (cancelled) return;
                setSearchData(prev => ({ ...prev, apiState: apiStates.error }));
            })

        return () => {
            cancelled = true;
        };

    }, [pageSize, searchTerm]);


    return (
        <div className="w-100 flex flex-column items-center">
            <div className="w-100 h3 flex items-center absolute bg-black-70 pv2 ph4 shadow-5 z-1" style={{ top: 0, position: "sticky" }}>
                <img className="h2" src="https://klue.com/wp-content/themes/klue/assets-home2/img/logo-klue.svg" alt="Klue logo" />
                <input className="input-reset ml3 pa2 br2 ba b--black-20 w5" defaultValue={searchTerm} placeholder="Search for a Photo" onChange={handleSearch} />
            </div>
            <Masonry>
                {photos.map((photo = {}) => {
                    const { id = "", urls = {}, alt_description = "", description = "" } = photo;
                    const altText = alt_description || description || `photo`;
                    return (urls.thumb &&
                        <img key={id} className="grow" src={urls.thumb} alt={altText} />
                    );
                })}
            </Masonry>
        </div>
    );
}
