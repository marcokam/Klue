import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { searchPhotos, apiStates } from "../../api";
import { Masonry } from "../Masonry/Masonry";

export function Search() {
    const { searchTerm } = useParams();
    const [searchData, setSearchData] = useState({ apiState: apiStates.none, payload: {} });
    const { results: photos = [] } = searchData.payload;

    useEffect(() => {
        if (!searchTerm) return;

        let cancelled = false;
        
        setSearchData(prev => ({ ...prev, apiState: apiStates.fetching }));
        searchPhotos({ query: searchTerm })
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

    }, [searchTerm]);


    return (
        <div className="search-photos-container">
            <input defaultValue={searchTerm} />
            <Masonry>
                {photos.map((photo = {}) => {
                    const { id = "", urls = {}, alt_description = "", description = "" } = photo;
                    const altText = alt_description || description || `photo`;
                    return (urls.thumb &&
                        <img key={id} src={urls.thumb} alt={altText} />
                    );
                })}
            </Masonry>
        </div>
    );
}
