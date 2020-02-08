import React, { useMemo, createRef, useCallback } from "react";
import {
    WindowScroller,
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    createMasonryCellPositioner,
    Masonry
} from "react-virtualized";

const columnWidth = 200;
const defaultHeight = 250;
const defaultWidth = columnWidth;
const spacer = 20;

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

export function PhotoGrid({ searchTerm = "", photos = [] }) {
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
            const { urls = {}, alt_description = "", description = "" } = item;
            const altText = alt_description || description || `photo`;

            return (
                item.id && (
                    <CellMeasurer cache={cellMeasurerCache} index={index} key={key} parent={parent}>
                        <div style={style}>
                            <img
                                src={urls.thumb}
                                alt={altText}
                                className="grow pointer w-100"
                                style={{
                                    height: height,
                                    width: columnWidth
                                }}
                            />
                        </div>
                    </CellMeasurer>
                )
            );
        },
        [photos]
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

    return (
        <WindowScroller scrollElement={window}>
            {({ height, scrollTop }) => (
                <AutoSizer height={height} disableHeight onResize={recalcGrid}>
                    {({ width }) => (
                        <Masonry
                            className="masonry-container"
                            keyMapper={index => {
                                const item = photos[index] || {};
                                return item ? item.id : null;
                            }}
                            key={width}
                            ref={masonryRef}
                            cellCount={photos.length}
                            cellMeasurerCache={cellMeasurerCache}
                            cellPositioner={cellPositioner}
                            cellRenderer={cellRenderer}
                            width={width}
                            height={height}
                            autoHeight
                            scrollTop={scrollTop}
                        />
                    )}
                </AutoSizer>
            )}
        </WindowScroller>
    );
}
