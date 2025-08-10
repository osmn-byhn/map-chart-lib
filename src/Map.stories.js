import { Map } from "./components/Map/Map";

const meta = {
  title: "Example/Map",
  component: Map,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    width: 800,
    height: 450
  },
};

export const CustomColors = {
  args: {
    width: 800,
    height: 450,
    landColor: "#4CAF50",
    oceanColor: "#2196F3",
    strokeColor: "#333"
  },
}; 