import { useEffect, useRef, useState } from "react";
import { select, zoom } from "d3";
import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { deriveCountryKeysFromFeature, pickStylesForCountry, CountryStylesMap } from "../../const/countryCodes";

// JSON import için tsconfig.json'da "resolveJsonModule": true olmalı
import worldDataRaw from "world-atlas/countries-110m.json";

export interface MapProps {
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

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

export const Map: React.FC<MapProps> = ({
  width = 800,
  height = 450,
  landColor = "#ddd",
  oceanColor = "#f0f0f0",
  strokeColor = "#000",
  zoomEnabled = true,
  panEnabled = true,
  lineStrong = 0.1,
  lineStyle = "solid",
  lineColor = "#000",
  countryStyles = {},
  tooltipContent = (name: any, country: Feature) => "",
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);

    if (zoomEnabled || panEnabled) {
      const zoomBehavior = zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

      svg.call(zoomBehavior);
    } else {
      svg.on(".zoom", null);
    }
  }, [zoomEnabled, panEnabled]);

  const countries: Feature[] = feature(
    worldDataRaw as any,
    (worldDataRaw as any).objects.countries
  ).features;

  const projection = geoNaturalEarth1().fitSize([width, height], { type: "Sphere" });
  const pathGenerator = geoPath().projection(projection);

  return (
    <div style={{ position: "relative", width, height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: `${lineStrong}px ${lineStyle} ${lineColor}`, display: "block" }}
        onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
      >
        <g ref={gRef}>
          {countries.map((country, i) => {
            const id = (country as any).id || `country-${i}`;
            const derived = deriveCountryKeysFromFeature(country);
            const styles = pickStylesForCountry(countryStyles, derived);
            const name = (country.properties as any)?.name || `Country ${id}`;

            return (
              <path
                key={id}
                d={pathGenerator(country as Feature<Geometry>) || ""}
                fill={styles.fill || landColor}
                fillOpacity={styles.fillOpacity != null ? styles.fillOpacity : 1.0}
                 stroke={styles.stroke || strokeColor}
                strokeWidth={styles.strokeWidth || 0.1}
                onMouseEnter={(e) =>
                  setTooltip({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    content: tooltipContent(name, country),
                  })
                }
                onMouseMove={(e) =>
                  setTooltip((prev) => ({
                    ...prev,
                    x: e.clientX,
                    y: e.clientY,
                  }))
                }
                onMouseLeave={() =>
                  setTooltip((prev) => ({ ...prev, visible: false }))
                }
                onClick={
                  styles.onClick
                    ? () => {
                        if (styles.onClick) {
                          styles.onClick(country, name);
                        }
                      }
                    : undefined
                }
              />
            );
          })}
        </g>
      </svg>

      {tooltip.visible && svgRef.current && (
        <div
          style={{
            position: "absolute",
            top: tooltip.y - svgRef.current.getBoundingClientRect().top + 10,
            left: tooltip.x - svgRef.current.getBoundingClientRect().left + 10,
            background: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "4px",
            pointerEvents: "none",
            fontSize: "14px",
            maxWidth: "200px",
            zIndex: 10,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};
