"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Earth: () => Earth_default,
  Map: () => Map,
  MapProps: () => Map_default
});
module.exports = __toCommonJS(index_exports);

// src/components/Earth/Earth.tsx
var import_react = require("react");
var import_d3_geo = require("d3-geo");
var import_topojson_client = require("topojson-client");
var import_countries_110m = __toESM(require("world-atlas/countries-110m.json"));

// src/const/countryCodes.ts
var import_i18n_iso_countries = __toESM(require("i18n-iso-countries"));
var import_en = __toESM(require("i18n-iso-countries/langs/en.json"));
try {
  import_i18n_iso_countries.default.registerLocale(import_en.default);
} catch {
}
function deriveCountryKeysFromFeature(countryFeature) {
  const rawId = countryFeature?.id;
  const idAsString = rawId != null ? String(rawId) : "";
  const numeric3 = idAsString.padStart(3, "0");
  let alpha2;
  let alpha3;
  try {
    alpha2 = import_i18n_iso_countries.default.numericToAlpha2(numeric3);
  } catch {
    alpha2 = void 0;
  }
  try {
    alpha3 = alpha2 ? import_i18n_iso_countries.default.alpha2ToAlpha3(alpha2) : void 0;
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

// src/components/Earth/Earth.tsx
var import_jsx_runtime = require("react/jsx-runtime");
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
  const canvasRef = (0, import_react.useRef)(null);
  const rotationRef = (0, import_react.useRef)([0, -30]);
  const scaleRef = (0, import_react.useRef)(1);
  const isDragging = (0, import_react.useRef)(false);
  const lastPos = (0, import_react.useRef)([0, 0]);
  const [tooltip, setTooltip] = (0, import_react.useState)({
    visible: false,
    x: 0,
    y: 0,
    content: ""
  });
  const [hoveredCountry, setHoveredCountry] = (0, import_react.useState)(
    null
  );
  (0, import_react.useEffect)(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const baseScale = height / 2.2;
    const projection = (0, import_d3_geo.geoOrthographic)().scale(baseScale * scaleRef.current).translate([width / 2, height / 2]).rotate(rotationRef.current);
    const path = (0, import_d3_geo.geoPath)().projection(projection).context(context);
    const countries2 = (0, import_topojson_client.feature)(
      import_countries_110m.default,
      import_countries_110m.default.objects.countries
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { position: "relative", width, height }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", { ref: canvasRef, width, height }),
    tooltip.visible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
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
var Earth_default = Earth;

// src/components/Map/Map.tsx
var import_react2 = require("react");
var import_d3 = require("d3");
var import_d3_geo2 = require("d3-geo");
var import_topojson_client2 = require("topojson-client");
var import_countries_110m2 = __toESM(require("world-atlas/countries-110m.json"));
var import_jsx_runtime2 = require("react/jsx-runtime");
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
  tooltipContent = () => ""
}) => {
  const svgRef = (0, import_react2.useRef)(null);
  const gRef = (0, import_react2.useRef)(null);
  const [tooltip, setTooltip] = (0, import_react2.useState)({
    visible: false,
    x: 0,
    y: 0,
    content: ""
  });
  (0, import_react2.useEffect)(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = (0, import_d3.select)(svgRef.current);
    const g = (0, import_d3.select)(gRef.current);
    if (zoomEnabled || panEnabled) {
      const zoomBehavior = (0, import_d3.zoom)().on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      svg.call(zoomBehavior);
    } else {
      svg.on(".zoom", null);
    }
  }, [zoomEnabled, panEnabled]);
  const countries2 = (0, import_topojson_client2.feature)(
    import_countries_110m2.default,
    import_countries_110m2.default.objects.countries
  ).features;
  const projection = (0, import_d3_geo2.geoNaturalEarth1)().fitSize([width, height], { type: "Sphere" });
  const pathGenerator = (0, import_d3_geo2.geoPath)().projection(projection);
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { position: "relative", width, height }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "svg",
      {
        ref: svgRef,
        width,
        height,
        style: { border: `${lineStrong}px ${lineStyle} ${lineColor}`, display: "block" },
        onMouseLeave: () => setTooltip({ ...tooltip, visible: false }),
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("g", { ref: gRef, children: countries2.map((country, i) => {
          const id = country.id || `country-${i}`;
          const derived = deriveCountryKeysFromFeature(country);
          const styles = pickStylesForCountry(countryStyles, derived);
          const name = country.properties?.name || `Country ${id}`;
          return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
    tooltip.visible && svgRef.current && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
var Map_default = Map;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Earth,
  Map,
  MapProps
});
