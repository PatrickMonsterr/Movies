# 🎬 FILMS Movie Rating Calculator

A simple, single-file web app for rating movies fairly across several categories and turning the result into a ready-to-use Letterboxd star rating. Works on mobile and desktop, no backend and no dependencies.

The interface is in Polish.

## What it does

Instead of giving a movie one gut-feeling score, you rate it in five categories based on the **FILMS framework**. The app calculates a weighted score (0–10) and converts it to a Letterboxd rating (0.5–5 stars, in half-star steps).

| Category | Weight | What it covers |
|---|---|---|
| Foundations | 30% | Screenplay, direction, structure, pacing |
| Layered Storytelling | 25% | Characters, dialogue, originality |
| Imagery | 20% | Cinematography, sound, music, production design |
| Motion | 15% | Editing, rhythm, flow and energy of scenes |
| Subtext | 10% | Themes, symbolism, what stays with you afterwards |

The weights are fixed on purpose, so ratings of different movies stay comparable.

## Features

- **Weighted scoring** with automatic conversion to Letterboxd stars
- **Subcategories**: break a category into parts (e.g. Imagery into cinematography, sound, music, production design); the category score becomes their average
- **"Not applicable" option**: skip a category (e.g. Subtext for a light comedy) and the remaining weights are rescaled to 100%
- **Gut-feeling check**: enter how many stars you feel before scoring; the app warns you if the calculated result differs by 1★ or more
- **Score descriptions** under every slider (from "terrible" to "flawless") and **helper questions** behind the "?" button for each category
- **Borderline rating picker**: when a score falls near a half-star boundary, you choose between the two options instead of blind rounding
- **Preliminary and final ratings**: save a rating right after the movie and confirm it later; the app reminds you after 24 hours
- **Edit and delete** saved ratings
- Optional "enjoyment" score and notes, kept separate from the calculated rating

## How the score is calculated

```
FILMS score = Σ(category score × weight) / Σ(weights of applicable categories)
Letterboxd stars = round(FILMS score / 2 to the nearest 0.5)
```

## Usage

Open `index.html` in any modern browser, or host it online (see below). On iPhone you can open the hosted page in Safari and use **Share → Add to Home Screen** to get an app-like icon.

## Data and privacy

All ratings are stored in your browser's `localStorage`. Nothing is sent anywhere. This also means:

- data is tied to one browser on one device,
- clearing the browser data deletes your ratings,
- the same page opened in a different browser or device starts empty.

## Deploy with GitHub Pages

1. Put `index.html` in the root of this repository.
2. Go to **Settings → Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then save.
4. After a minute or two the app is available at `https://<your-username>.github.io/<repository-name>/`.

## Tech

Plain HTML, CSS and JavaScript in a single file. Supports light and dark mode automatically.
