/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base: './'` emits relative asset URLs, so the build works whether it is
// served from a user/org page (https://user.github.io/) or a project page
// (https://user.github.io/calendar-of-your-life/) without hardcoding the path.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
