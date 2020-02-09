import "./ImageControl.scss";
import React from "react";

export function ImageControl({ gridPhotoClass = "", imageProps = {}, description = "", user = {} }) {
    const { name = "", profile_image = {} } = user;
    return (
        <div className="imageControl">
            <img alt="no caption" {...imageProps} />
            {description && <p className="mv2">{description}</p>}
            <div className={`overlay bg-black-30 absolute absolute--fill pa3 br3 white pointer ${gridPhotoClass}`}>
                <div className="flex items-center">
                    <img className="br-100" src={profile_image.small} alt={name} />
                    <span className="ml2">{name}</span>
                </div>
            </div>
        </div>
    );
}
