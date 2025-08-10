import React, { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, GeoProjection } from "d3-geo";
import { feature, FeatureCollection } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import {
  deriveCountryKeysFromFeature,
  pickStylesForCountry,
} from "../../const/countryCodes";
import type * as GeoJSON from "geojson";

// Country type (topojson feature with optional props)
type CountryFeature = GeoJSON.Feature<GeoJSON.Geometry, { name?: string }> & {
  id?: string | number;
};

export type EarthProps = {
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
  countryStyles?: Record<
    string,
    {
      fillOpacity: null;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      onClick?: (country: CountryFeature, name: string) => void;
    }
  >;
};

const Earth: React.FC<EarthProps> = ({
  width = 800,
  height = 800,
  landColor = "#4CAF50",
  oceanColor = "#2196F3",
  strokeColor = "#333",
  zoomEnabled = true,
  panEnabled = true,
  lineStrong = 0.1,
  lineStyle = "solid",
  lineColor = "#000",
  tooltipContent = () => "",
  countryStyles = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<[number, number]>([0, -30]);
  const scaleRef = useRef<number>(1);
  const isDragging = useRef<boolean>(false);
  const lastPos = useRef<[number, number]>([0, 0]);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });

  const [hoveredCountry, setHoveredCountry] = useState<CountryFeature | null>(
    null
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const baseScale = height / 2.2;
    const projection: GeoProjection = geoOrthographic()
      .scale(baseScale * scaleRef.current)
      .translate([width / 2, height / 2])
      .rotate(rotationRef.current);

    const path = geoPath().projection(projection).context(context);

    const countries: CountryFeature[] = feature(
      worldData as any,
      (worldData as any).objects.countries
    ).features as CountryFeature[];

    function drawGlobe() {
      if (!context) return;
      context.clearRect(0, 0, width, height);

      // Okyanus
      context.beginPath();
      context.fillStyle = oceanColor;
      context.arc(
        width / 2,
        height / 2,
        projection.scale() || 0,
        0,
        2 * Math.PI
      );
      context.fill();

      // Sphere çizimi
      context.beginPath();
      path({ type: "Sphere" });
      context.strokeStyle = strokeColor;
      context.lineWidth = 0.5;
      context.stroke();

      countries.forEach((feature, i) => {
        const id = feature.id || `country-${i}`;
        const derived = deriveCountryKeysFromFeature(feature);
        const styles = pickStylesForCountry(countryStyles, derived);

        context.beginPath();
        path(feature);

        let fillColor = styles.fill || landColor;
        if (hoveredCountry && hoveredCountry.id === id) {
          fillColor = styles.fill || landColor;
          context.globalAlpha = 0.8;
        }

        context.fillStyle = fillColor;
        context.fill();
        context.globalAlpha = 1.0;

        context.strokeStyle = styles.stroke || strokeColor;
        context.lineWidth = styles.strokeWidth || 0.3;
        context.stroke();
      });
    }

    let animationId: number;
    function animate() {
      const rot = rotationRef.current;
      rot[0] += 0.2;
      projection.rotate(rot);
      projection.scale(baseScale * scaleRef.current);
      drawGlobe();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const getCountryAtPoint = (x: number, y: number) => {
      const point = projection.invert([x, y]);
      if (!point) return null;

      for (let i = 0; i < countries.length; i++) {
        const country = countries[i];
        if (path.area(country) > 0) {
          context.save();
          context.beginPath();
          path(country);
          if (context.isPointInPath(x, y)) {
            context.restore();
            return country;
          }
          context.restore();
        }
      }
      return null;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const mousePos = getMousePos(e);
      const country = getCountryAtPoint(mousePos.x, mousePos.y);

      if (country) {
        const id = country.id || `country-${countries.indexOf(country)}`;
        const derived = deriveCountryKeysFromFeature(country);
        const styles = pickStylesForCountry(countryStyles, derived);
        if (styles.onClick) {
          const name = country.properties?.name || `Country ${id}`;
          styles.onClick(country, name);
        }
      }

      isDragging.current = true;
      lastPos.current = [e.clientX, e.clientY];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) {
        const mousePos = getMousePos(e);
        const country = getCountryAtPoint(mousePos.x, mousePos.y);

        if (country) {
          const name = country.properties?.name || `Country ${country.id}`;
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            content: tooltipContent(name, country),
          });
          setHoveredCountry(country);
        } else {
          setTooltip((prev) => ({ ...prev, visible: false }));
          setHoveredCountry(null);
        }
        return;
      }

      const dx = e.clientX - lastPos.current[0];
      const dy = e.clientY - lastPos.current[1];
      lastPos.current = [e.clientX, e.clientY];
      rotationRef.current[0] += dx * 0.5;
      rotationRef.current[1] -= dy * 0.5;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleMouseLeave = () => {
      isDragging.current = false;
      setTooltip((prev) => ({ ...prev, visible: false }));
      setHoveredCountry(null);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      scaleRef.current *= zoomFactor;
      scaleRef.current = Math.max(0.5, Math.min(3, scaleRef.current));
    };

    // Event binding
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("wheel", handleWheel);

    // Touch events
    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      isDragging.current = true;
      const touch = e.touches[0];
      lastPos.current = [touch.clientX, touch.clientY];
    });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (!isDragging.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - lastPos.current[0];
      const dy = touch.clientY - lastPos.current[1];
      lastPos.current = [touch.clientX, touch.clientY];
      rotationRef.current[0] += dx * 0.5;
      rotationRef.current[1] -= dy * 0.5;
    });

    canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      isDragging.current = false;
    });

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    width,
    height,
    landColor,
    oceanColor,
    strokeColor,
    tooltipContent,
    countryStyles,
    hoveredCountry,
  ]);

  return (
    <div style={{ position: "relative", width, height }}>
      <canvas ref={canvasRef} width={width} height={height} />

      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            top:
              tooltip.y -
              (canvasRef.current?.getBoundingClientRect().top || 0) +
              10,
            left:
              tooltip.x -
              (canvasRef.current?.getBoundingClientRect().left || 0) +
              10,
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

export default Earth;
