# IELTS Vocab Master

A responsive IELTS preparation prototype for learners in Bangladesh.

## Run locally

```sh
npm install
npm run dev
```

Create a production bundle with `npm run build`.

## Project structure

- `index.html`: app entry and font metadata.
- `src/main.js`: prototype screens, sample content, browser interactions, and local persistence.
- `src/style.css`: shared theme and responsive layouts.
- `package.json`: Vite scripts and development dependency.

The single-page structure keeps the early product surface small. Screens can be split into feature modules when their data contracts and backend behavior are established.

## Prototype boundaries

Signup, profile setup, saved words, learned words, theme, and demo content are stored in browser local storage. Google sign-in is a placeholder. Admin screens are for layout exploration only and are not protected by authentication or authorization. Do not use this prototype for real accounts, private user data, subscriptions, or payments.

Production work still needs Firebase Auth, Firestore and Storage rules, trusted Cloud Functions for role and subscription changes, payment-provider verification, and real content/audio data. Premium access must be granted by the trusted backend after verifying a payment; it must never be controlled by frontend state.