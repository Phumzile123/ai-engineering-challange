
# NexEra AI Engineering Challenge

## Overview
This project implements two interactive AI-powered prototypes for the NexEra one-week AI Engineering Challenge:

1. **AI-Generated 3D Asset Pipeline**
2. **Natural Language → Avatar Animation**

The project is designed as a lightweight web prototype that can be hosted on GitHub Pages.

---

## Prototype 1: AI → 3D Asset Pipeline
### Features
- User types an object description or uploads an image
- System retrieves a suitable 3D model
- Model is loaded into a 3D viewer
- Model is automatically centered and scaled
- User can rotate and inspect the model
- Educational summary is displayed

### Current Logic
- Keyword-based AI retrieval simulation
- GLB model loading using Three.js
- Auto-centering and scaling

### Example Input
- “a yellow hard hat”
- “helmet”
- image upload with a related filename

---

## Prototype 2: Natural Language → Avatar Animation
### Features
- User enters a natural language command
- System interprets the command intent
- Avatar loads in a 3D scene
- Matching animation is played when available
- AI explanation is shown

### Example Commands
- “wave hello to the learner”
- “walk to the table”
- “point at the fire extinguisher”
- “show the correct safety posture”

---

## Technologies Used
- HTML
- CSS
- JavaScript
- Three.js
- GLTFLoader
- OrbitControls

---

## How to Run
1. Download or clone the repository
2. Open the project folder in Visual Studio Code
3. Run it using Live Server or any local server
4. Open `index.html` in the browser

---

## Hosting
This project can be deployed on:
- GitHub Pages
- Netlify
- Vercel

---

## Limitations
- Asset retrieval is currently rule-based
- Avatar command interpretation is keyword-based
- External 3D assets depend on public URLs
- Some animation clips may not exactly match every command

---

## Future Improvements
- Add a backend with OpenAI or another LLM API for richer reasoning
- Add image classification for uploaded images
- Add real text-to-3D generation pipeline
- Add proper motion libraries such as Mixamo, DeepMotion, or Rokoko
- Add scene context and object-aware actions
- Add educational analytics for learner interaction tracking