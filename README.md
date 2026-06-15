# Investor Challenge Teacher Console

GitHub Pages-ready web app for tracking student activity during the Investor Challenge simulation.

## What it tracks

- Student cash
- QH, II and BZ shares
- Current share price, change from last update and shares available
- Bank term deposits
- Spending and reward purchases
- Portfolio value
- Portfolio value over time
- Built-in Lesson 1, Lesson 2 and Lesson 3 market card decks

## How to host on GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, `app.js` and this README.
3. Go to repository **Settings**.
4. Open **Pages**.
5. Choose the `main` branch and `/root` folder.
6. Save.
7. Open the GitHub Pages URL.

No build step is required.

## Data storage

All data is saved in the browser using `localStorage`.
It is not sent to a server.

Use **Export JSON backup** at the end of each lesson.
