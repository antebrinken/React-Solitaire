module.exports = {
  mode: 'jit',
  purge: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './src/**/*.less'
  ],
  darkMode: false,
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  corePlugins: {
    // Avoid preflight resets clashing with Ant Design and existing Less
    preflight: false
  },
  plugins: []
};
