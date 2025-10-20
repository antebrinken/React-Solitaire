module.exports = {
  // Keep PostCSS minimal to avoid browserslist env conflicts.
  // Tailwind does not require autoprefixer to compile utilities.
  plugins: [require('tailwindcss')]
};
