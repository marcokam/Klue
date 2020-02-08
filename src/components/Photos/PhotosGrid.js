import React, { useMemo, createRef } from "react";
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

const createCache = () =>
    new CellMeasurerCache({
        defaultHeight,
        defaultWidth,
        fixedWidth: true
    });
const createCellPositioner = ({ cache }) =>
    createMasonryCellPositioner({
        cellMeasurerCache: cache,
        columnCount: 4,
        columnWidth,
        spacer: 20
    });


export function PhotoGrid({ searchTerm, photos = [] }) {
    const masonryRef = createRef();
    const { cache, cellPositioner } = useMemo(() => {
        const cache = createCache();
        const cellPositioner = createCellPositioner({ cache });
        return { cache, cellPositioner };
    }, []);
    const { cellRenderer } = useMemo(() => {
        const cellRenderer = ({ index, key, parent, style }) => {
            const item = photos[index] || {};
            const height = columnWidth * (item.height / item.width) || defaultHeight;
            const { urls = {}, alt_description = "", description = "" } = item;
            const altText = alt_description || description || `photo`;

            return (
                item.id && (
                    <CellMeasurer cache={cache} index={index} key={key} parent={parent}>
                        <div style={style}>
                            <img
                                src={urls.thumb}
                                alt={altText}
                                className="grow pointer"
                                style={{
                                    height: height,
                                    width: columnWidth
                                }}
                            />
                        </div>
                    </CellMeasurer>
                )
            );
        };
        return { cellRenderer };
    }, [cache, photos]);

    return (
        <WindowScroller scrollElement={window}>
            {({ height, scrollTop }) => (
                <AutoSizer height={height} scrollTop={scrollTop} disableHeight>
                    {({ width }) => (
                        <div key={searchTerm}>
                            <Masonry
                                keyMapper={index => {
                                    const item = photos[index] || {};
                                    return item ? item.id : null;
                                }}
                                ref={masonryRef}
                                cellCount={photos.length}
                                cellMeasurerCache={cache}
                                cellPositioner={cellPositioner}
                                cellRenderer={cellRenderer}
                                width={width}
                                height={height}
                                autoHeight
                                scrollTop={scrollTop}
                            />
                        </div>
                    )}
                </AutoSizer>
            )}
        </WindowScroller>
    );
}
