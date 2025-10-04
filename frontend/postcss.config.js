// PostCSS config not needed when using @tailwindcss/vite plugin
// The Vite plugin handles Tailwind processing automatically

export default {
  plugins: {
    // tailwindcss: {}, // Handled by @tailwindcss/vite
    autoprefixer: {}, // Keep autoprefixer for browser compatibility
  },
}