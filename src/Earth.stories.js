import Earth from "./components/Earth/Earth";

const meta = {
  title: "Example/Earth",
  component: Earth,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;

export const Default = {
  args: {
    width: 800,
    height: 800
  },
};

export const CustomColors = {
  args: {
    width: 800,
    height: 800,
    landColor: "#4CAF50",
    oceanColor: "#2196F3",
    strokeColor: "#333"
  },
}; 