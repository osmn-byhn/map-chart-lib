// src/components/Map/Map.tsx
import { useEffect, useRef, useState } from "react";
import { select, zoom } from "d3";
import { geoPath, geoNaturalEarth1 } from "d3-geo";
import { feature } from "topojson-client";

// src/const/countryCodes.ts
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
try {
  countries.registerLocale(enLocale);
} catch {
}
function deriveCountryKeysFromFeature(countryFeature) {
  const rawId = countryFeature?.id;
  const idAsString = rawId != null ? String(rawId) : "";
  const numeric3 = idAsString.padStart(3, "0");
  let alpha2;
  let alpha3;
  try {
    alpha2 = countries.numericToAlpha2(numeric3);
  } catch {
    alpha2 = void 0;
  }
  try {
    alpha3 = alpha2 ? countries.alpha2ToAlpha3(alpha2) : void 0;
  } catch {
    alpha3 = void 0;
  }
  return {
    id: idAsString,
    numeric3,
    alpha2,
    alpha3
  };
}
function pickStylesForCountry(countryStyles, derivedKeys) {
  if (!countryStyles || typeof countryStyles !== "object") return {
    fillOpacity: null
  };
  const tryKey = (keyCandidate) => {
    if (!keyCandidate) return void 0;
    if (countryStyles[keyCandidate] != null) return countryStyles[keyCandidate];
    const upper = keyCandidate.toUpperCase();
    const lower = keyCandidate.toLowerCase();
    if (upper && countryStyles[upper] != null) return countryStyles[upper];
    if (lower && countryStyles[lower] != null) return countryStyles[lower];
    return void 0;
  };
  return tryKey(derivedKeys.alpha2) || tryKey(derivedKeys.alpha3) || tryKey(derivedKeys.numeric3) || tryKey(derivedKeys.id) || { fillOpacity: null };
}

// src/components/Map/Map.tsx
import worldDataRaw from "world-atlas/countries-110m.json";
import { jsx, jsxs } from "react/jsx-runtime";
var Map = ({
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
  tooltipContent = (name, country) => ""
}) => {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: ""
  });
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const g = select(gRef.current);
    if (zoomEnabled || panEnabled) {
      const zoomBehavior = zoom().on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      svg.call(zoomBehavior);
    } else {
      svg.on(".zoom", null);
    }
  }, [zoomEnabled, panEnabled]);
  const countries2 = feature(
    worldDataRaw,
    worldDataRaw.objects.countries
  ).features;
  const projection = geoNaturalEarth1().fitSize([width, height], { type: "Sphere" });
  const pathGenerator = geoPath().projection(projection);
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", width, height }, children: [
    /* @__PURE__ */ jsx(
      "svg",
      {
        ref: svgRef,
        width,
        height,
        style: { border: `${lineStrong}px ${lineStyle} ${lineColor}`, display: "block" },
        onMouseLeave: () => setTooltip({ ...tooltip, visible: false }),
        children: /* @__PURE__ */ jsx("g", { ref: gRef, children: countries2.map((country, i) => {
          const id = country.id || `country-${i}`;
          const derived = deriveCountryKeysFromFeature(country);
          const styles = pickStylesForCountry(countryStyles, derived);
          const name = country.properties?.name || `Country ${id}`;
          return /* @__PURE__ */ jsx(
            "path",
            {
              d: pathGenerator(country) || "",
              fill: styles.fill || landColor,
              fillOpacity: styles.fillOpacity != null ? styles.fillOpacity : 1,
              stroke: styles.stroke || strokeColor,
              strokeWidth: styles.strokeWidth || 0.1,
              onMouseEnter: (e) => setTooltip({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                content: tooltipContent(name, country)
              }),
              onMouseMove: (e) => setTooltip((prev) => ({
                ...prev,
                x: e.clientX,
                y: e.clientY
              })),
              onMouseLeave: () => setTooltip((prev) => ({ ...prev, visible: false })),
              onClick: styles.onClick ? () => {
                if (styles.onClick) {
                  styles.onClick(country, name);
                }
              } : void 0
            },
            id
          );
        }) })
      }
    ),
    tooltip.visible && svgRef.current && /* @__PURE__ */ jsx(
      "div",
      {
        style: {
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
          zIndex: 10
        },
        children: tooltip.content
      }
    )
  ] });
};

// src/components/Earth/Earth.tsx
import { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";
import { geoOrthographic, geoPath as geoPath2 } from "d3-geo";
import { feature as feature2 } from "topojson-client";
import worldData from "world-atlas/countries-110m.json";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var Earth = ({
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
  countryStyles = {}
}) => {
  const canvasRef = useRef2(null);
  const rotationRef = useRef2([0, -30]);
  const scaleRef = useRef2(1);
  const isDragging = useRef2(false);
  const lastPos = useRef2([0, 0]);
  const [tooltip, setTooltip] = useState2({
    visible: false,
    x: 0,
    y: 0,
    content: ""
  });
  const [hoveredCountry, setHoveredCountry] = useState2(
    null
  );
  useEffect2(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const baseScale = height / 2.2;
    const projection = geoOrthographic().scale(baseScale * scaleRef.current).translate([width / 2, height / 2]).rotate(rotationRef.current);
    const path = geoPath2().projection(projection).context(context);
    const countries2 = feature2(
      worldData,
      worldData.objects.countries
    ).features;
    function drawGlobe() {
      if (!context) return;
      context.clearRect(0, 0, width, height);
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
      context.beginPath();
      path({ type: "Sphere" });
      context.strokeStyle = strokeColor;
      context.lineWidth = 0.5;
      context.stroke();
      countries2.forEach((feature3, i) => {
        const id = feature3.id || `country-${i}`;
        const derived = deriveCountryKeysFromFeature(feature3);
        const styles = pickStylesForCountry(countryStyles, derived);
        context.beginPath();
        path(feature3);
        let fillColor = styles.fill || landColor;
        if (hoveredCountry && hoveredCountry.id === id) {
          fillColor = styles.fill || landColor;
          context.globalAlpha = 0.8;
        }
        context.fillStyle = fillColor;
        context.fill();
        context.globalAlpha = 1;
        context.strokeStyle = styles.stroke || strokeColor;
        context.lineWidth = styles.strokeWidth || 0.3;
        context.stroke();
      });
    }
    let animationId;
    function animate() {
      const rot = rotationRef.current;
      rot[0] += 0.2;
      projection.rotate(rot);
      projection.scale(baseScale * scaleRef.current);
      drawGlobe();
      animationId = requestAnimationFrame(animate);
    }
    animate();
    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    const getCountryAtPoint = (x, y) => {
      const point = projection.invert([x, y]);
      if (!point) return null;
      for (let i = 0; i < countries2.length; i++) {
        const country = countries2[i];
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
    const handleMouseDown = (e) => {
      const mousePos = getMousePos(e);
      const country = getCountryAtPoint(mousePos.x, mousePos.y);
      if (country) {
        const id = country.id || `country-${countries2.indexOf(country)}`;
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
    const handleMouseMove = (e) => {
      if (!isDragging.current) {
        const mousePos = getMousePos(e);
        const country = getCountryAtPoint(mousePos.x, mousePos.y);
        if (country) {
          const name = country.properties?.name || `Country ${country.id}`;
          setTooltip({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            content: tooltipContent(name, country)
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
    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      scaleRef.current *= zoomFactor;
      scaleRef.current = Math.max(0.5, Math.min(3, scaleRef.current));
    };
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("wheel", handleWheel);
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
    hoveredCountry
  ]);
  return /* @__PURE__ */ jsxs2("div", { style: { position: "relative", width, height }, children: [
    /* @__PURE__ */ jsx2("canvas", { ref: canvasRef, width, height }),
    tooltip.visible && /* @__PURE__ */ jsx2(
      "div",
      {
        style: {
          position: "absolute",
          top: tooltip.y - (canvasRef.current?.getBoundingClientRect().top || 0) + 10,
          left: tooltip.x - (canvasRef.current?.getBoundingClientRect().left || 0) + 10,
          background: "rgba(0, 0, 0, 0.7)",
          color: "#fff",
          padding: "6px 10px",
          borderRadius: "4px",
          pointerEvents: "none",
          fontSize: "14px",
          maxWidth: "200px",
          zIndex: 10
        },
        children: tooltip.content
      }
    )
  ] });
};
export {
  Earth,
  Map
};
