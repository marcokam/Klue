import React, { Fragment, useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { debounce } from "lodash-es";

import { searchPhotos, apiStates } from "../../api";
import { PhotoGrid } from "../Photos/PhotosGrid";

export function Search({ pageSize = 30 }) {
    const { searchTerm: initialSearchTerm = "" } = useParams();
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const dbSetSearchTerm = useMemo(() => debounce(setSearchTerm, 200), []);
    const [photos, setPhotos] = useState([]);
    const [metaData, setMetaData] = useState({ apiState: apiStates.none, data: {} });
    const handleSearch = useCallback(
        event => {
            const searchTerm = (event && event.target && event.target.value) || "";
            dbSetSearchTerm(searchTerm);
        },
        [dbSetSearchTerm]
    );

    useEffect(() => {
        if (!searchTerm) {
            setMetaData(prev => ({ ...prev, data: {} }));
        }

        let cancelled = false;
        setMetaData(prev => ({ ...prev, apiState: apiStates.fetching }));
        setPhotos([]);
        searchPhotos({ query: searchTerm, per_page: pageSize })
            .then(({ results = [], ...data } = {}) => {
                if (cancelled) return;
                setMetaData({ apiState: apiStates.fetched, data });
                setPhotos(results);
            })
            .catch(err => {
                if (cancelled) return;
                setMetaData(prev => ({ ...prev, apiState: apiStates.error }));
            });

        return () => {
            cancelled = true;
        };
    }, [pageSize, searchTerm]);

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
                    className="input-reset ml3 pa2 br2 ba b--black-20 w5"
                    defaultValue={searchTerm}
                    placeholder="Search for a Photo"
                    onChange={handleSearch}
                />
            </div>
            <div className="w-100 mw9 mt4 ph6">
                {metaData.apiState === apiStates.fetched && (
                    <Fragment>
                        <div className="pa2">{JSON.stringify(metaData)}</div>
                        {photos.length > 0 && <div key={searchTerm}><PhotoGrid searchTerm={searchTerm} photos={photos} metaData={metaData} /></div>}
                    </Fragment>
                )}
            </div>
        </div>
    );
}
