import React from 'react';
import * as GeoJSON from 'geojson';
import { Feature } from 'geojson';

type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, {
    name?: string;
}> & {
    id?: string | number;
};
type EarthProps = {
    width?: number;
    height?: number;
    landColor?: string;
    oceanColor?: string;
    strokeColor?: string;
    zoomEnabled?: boolean;
    panEnabled?: boolean;
    lineStrong?: number;
    lineStyle?: string;
    lineColor?: string;
    tooltipContent?: (name: string, country: CountryFeature) => string;
    countryStyles?: Record<string, {
        fillOpacity: null;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        onClick?: (country: CountryFeature, name: string) => void;
    }>;
};
declare const Earth: React.FC<EarthProps>;

interface CountryStyle {
    fillOpacity: null;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onClick?: (feature: Feature, name: string) => void;
}
type CountryStylesMap = Record<string, CountryStyle>;

interface MapProps {
    width?: number;
    height?: number;
    landColor?: string;
    oceanColor?: string;
    strokeColor?: string;
    zoomEnabled?: boolean;
    panEnabled?: boolean;
    lineStrong?: number;
    lineStyle?: "solid" | "dashed" | "dotted";
    lineColor?: string;
    countryStyles?: CountryStylesMap;
    tooltipContent?: (name: string, feature: Feature) => string;
}
declare const Map: React.FC<MapProps>;

export { Earth, type EarthProps, Map, Map as MapProps };
