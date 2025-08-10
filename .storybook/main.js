module.exports = {
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  framework: "@storybook/react-webpack5",
  docs: {
    autodocs: "tag",
  },
  typescript: {
    check: false,
    reactDocgen: false,
  },
  webpackFinal: async (config) => {
    // Add TypeScript support
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      ],
    });
    
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
  },
}; 