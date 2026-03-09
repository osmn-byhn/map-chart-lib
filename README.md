
# map-chart-lib

A lightweight JavaScript library for rendering **interactive SVG-based maps and charts** easily in web applications.

`map-chart-lib` allows you to visualize geographical data and create map-based charts with minimal setup. It is designed to be **simple, flexible, and lightweight**, making it ideal for dashboards, analytics tools, and data visualization projects.

---

## ✨ Features

- 🌍 SVG-based map rendering
- ⚡ Lightweight and fast
- 🧩 Easy integration with any JavaScript project
- 🎨 Customizable styles and colors
- 📊 Map-based data visualization
- 🖱 Interactive events support
- 📦 Works with modern bundlers

---

## 📦 Installation

Using **npm**

```bash
npm install map-chart-lib
````

Using **yarn**

```bash
yarn add map-chart-lib
```

---

## 🚀 Usage

Basic example:

```javascript
import { MapChart } from "map-chart-lib";

const chart = new MapChart({
  container: "#map",
  data: [
    { id: "TR", value: 100 },
    { id: "US", value: 200 }
  ]
});

chart.render();
```

---

## ⚙️ Configuration

Example configuration options:

```javascript
const chart = new MapChart({
  container: "#map",
  width: 800,
  height: 500,
  data: [],
  colors: {
    min: "#e0f2ff",
    max: "#0055ff"
  }
});
```

### Options

| Option      | Description               |
| ----------- | ------------------------- |
| `container` | Target DOM element        |
| `width`     | Chart width               |
| `height`    | Chart height              |
| `data`      | Map data values           |
| `colors`    | Color scale configuration |

---

## 📊 Data Format

Example data structure:

```javascript
[
  { id: "US", value: 120 },
  { id: "DE", value: 80 },
  { id: "TR", value: 95 }
]
```

Each item represents a region with a value used for visualization.

---

## 🧩 Integration

`map-chart-lib` works with:

* React
* Vue
* Angular
* Vanilla JavaScript
* Node based build tools

---

## 🛠 Development

Clone the repository:

```bash
git clone https://github.com/osmn-byhn/map-chart-lib.git
```

Install dependencies:

```bash
npm install
```

Run development build:

```bash
npm run dev
```

Build the library:

```bash
npm run build
```

---

## 📄 License

MIT License

---

## 🤝 Contributing

Contributions are welcome!

If you'd like to improve the library:

1. Fork the repository
2. Create a new branch
3. Submit a pull request

