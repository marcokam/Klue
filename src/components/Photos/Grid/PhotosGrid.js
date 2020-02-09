import "./PhotosGrid.scss";
import React, { Fragment, useMemo, createRef, useCallback } from "react";
import {
    WindowScroller,
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    createMasonryCellPositioner,
    Masonry
} from "react-virtualized";
import { debounce } from "lodash-es";
import { Loading } from "../../UI/Loading/Loading";
import { apiStates } from "../../../api";
import { ImageControl } from "../ImageControl/ImageControl";

const columnWidth = 200;
const defaultHeight = 300;
const defaultWidth = columnWidth;
const spacer = 20;

const noop = () => {};
const cellMeasurerCache = new CellMeasurerCache({
    defaultHeight,
    defaultWidth,
    fixedWidth: true
});
const getCellPositionerValues = width => ({
    columnCount: Math.floor(width / (columnWidth + spacer)),
    columnWidth,
    spacer
});
const gridPhotoClass = "gridPhoto";
const selectedClass = "selected";

export function PhotoGrid({ photos = [], query = {}, getNext = noop }) {
    const masonryContainerRef = createRef();
    const masonryRef = createRef();
    const cellPositioner = useMemo(
        () =>
            createMasonryCellPositioner({
                cellMeasurerCache,
                ...getCellPositionerValues()
            }),
        []
    );
    const cellRenderer = useMemo(
        () => ({ index, key, parent, style }) => {
            const item = photos[index] || {};
            const height = columnWidth * (item.height / item.width) || defaultHeight;
            const { urls = {}, alt_description = "", description = "", user = {} } = item;
            const altText = alt_description || description || `photo`;
            const { apiState } = query;

            if (index > 0 && index === photos.length - 1) getNext();

            return (
                <Fragment>
                    {item.id && (
                        <CellMeasurer cache={cellMeasurerCache} index={index} key={key} parent={parent}>
                            <div style={style} className="br3 bg-near-white pa2">
                                <ImageControl
                                    gridPhotoClass={gridPhotoClass}
                                    imageProps={{
                                        src: urls.thumb,
                                        alt: altText,
                                        className: "br3 pointer w-100",
                                        style: {
                                            height: height,
                                            width: columnWidth
                                        }
                                    }}
                                    description={alt_description}
                                    user={user}
                                />
                            </div>
                        </CellMeasurer>
                    )}
                    {index > 0 && index === photos.length - 1 && apiState && apiState === apiStates.fetching && (
                        <Loading key="photoGridLoader" className="absolute bottom-0 w-100" />
                    )}
                </Fragment>
            );
        },
        [getNext, photos, query]
    );
    const recalcGrid = useCallback(
        ({ width }) => {
            cellMeasurerCache.clearAll();
            cellPositioner.reset(getCellPositionerValues(width));
            if (masonryRef.current) {
                masonryRef.current.recomputeCellPositions();
            }
        },
        [cellPositioner, masonryRef]
    );
    const toggleSelected = useCallback(
        debounce((node, shouldSet = false) => {
            const container = document.querySelector(".ReactVirtualized__Masonry__innerScrollContainer");
            if (container) {
                const wrapperEls = document.querySelectorAll(".ReactVirtualized__Masonry__innerScrollContainer > div");
                wrapperEls.forEach(div => {
                    div.classList.remove(selectedClass);
                    if (shouldSet && div.contains(node)) {
                        div.classList.add(selectedClass);
                    }
                });
                if (shouldSet) {
                    container.classList.add(selectedClass);
                } else {
                    container.classList.remove(selectedClass);
                }
            }
        }, 200),
        []
    );

    const handleMouseOver = useCallback(
        event => {
            if (event && event.target && event.target.classList.contains(gridPhotoClass)) {
                toggleSelected(event.target, true);
            }
        },
        [toggleSelected]
    );
    const handleMouseOut = useCallback(
        event => {
            toggleSelected(event.target, false);
        },
        [toggleSelected]
    );

    return (
        <WindowScroller scrollElement={window} onScroll={handleMouseOut}>
            {({ height, scrollTop }) => (
                <AutoSizer height={height} disableHeight onResize={recalcGrid}>
                    {({ width }) => (
                        <div ref={masonryContainerRef} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                            <Masonry
                                className="photosGrid"
                                keyMapper={index => {
                                    const item = photos[index] || {};
                                    return item ? item.id : null;
                                }}
                                ref={masonryRef}
                                cellCount={photos.length}
                                cellMeasurerCache={cellMeasurerCache}
                                cellPositioner={cellPositioner}
                                cellRenderer={cellRenderer}
                                width={width}
                                height={height}
                                autoHeight
                                scrollTop={scrollTop}
                                overscanByPixels={50}
                            />
                        </div>
                    )}
                </AutoSizer>
            )}
        </WindowScroller>
    );
}
