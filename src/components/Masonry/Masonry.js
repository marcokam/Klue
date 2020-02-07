import "./Masonry.scss";
import React from "react";


export function Masonry({ children = [] }) {
    console.log('children', children);
    return (
        <div className="masonry-container">
            {React.Children.map(children, child => {
                return (
                    <div className="w-100 dib bg-white tc">
                        {React.cloneElement(child)}
                    </div>
                );
            })}
        </div>
    );
}