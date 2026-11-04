# Calendar of Your Life

A web application based on Kurzgesagt's [Calendar of Your Life Infographic](https://shop-us.kurzgesagt.org/collections/existential-dread/products/lifespan-calendar-poster?variant=39451596423216) poster. I knew I would be too lazy to carry the poster around and I wanted to make it digital and free for everyone to use. If you like this kind of work and would like to support the original creators, please consider donating to Kurzgesagt's [Patreon](https://kurzgesagt.org/patreon-2/).

## Incentive

> On most days, life is sort of happening, passing you by. You are just busy keeping your head above water. So it is not easy to figure out what to do with your life and how to spend your time. The Calendar of Your Life website lets you track how many weeks of your life you have spent already and how many you have left

## Video

[![YouTube thumbnail](http://i3.ytimg.com/vi/JXeJANDKwDc/maxresdefault.jpg)](https://www.youtube.com/watch?v=JXeJANDKwDc)

## Features

- Enter your birthdate once; it is saved in your browser's local storage and never leaves your device.
- One row per year, 52 weeks per row. Weeks you've lived are filled in and the current week pulses.
- Rows are colored by life stage (childhood, adolescence, early/middle/mature/late adulthood), with a toggle for a monochrome view.
- Pick a life expectancy of 70, 80, 90 or 100 years.
- Hover any week to see its dates and age.
- Star milestones: the weeks that mattered, or ones you're looking forward to. They show on the grid, in the tooltip and on the printed stats page.
- Press Ctrl/⌘+P to print it as a one-page poster, a calendar page plus a stats page, or just the grid, on anything from letter/A4 paper to a 24 × 36 in poster (or save as PDF for a print shop).
- Light and dark themes: follows your system setting by default, or pick one.

## Development

Requires Node 20+ (see `.nvmrc`).

```bash
npm install
npm run dev       # dev server with hot reload at http://localhost:5173
npm test          # unit tests (Vitest)
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build locally
```

Built with [React](https://react.dev), [TypeScript](https://www.typescriptlang.org) and [Vite](https://vite.dev). The calendar is a single responsive SVG; all the date math lives in [`src/lib/life.ts`](src/lib/life.ts).

## Deployment

Every push to `master` builds the site and publishes it to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The build uses relative asset paths, so it works at `https://<user>.github.io/calendar-of-your-life/` without any extra configuration.

One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
