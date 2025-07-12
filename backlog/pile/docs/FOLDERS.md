# Folder Structure

```kotlin
    those-who-came-before/
    │
    ├── public/
    │   ├── index.html
    │   └── assets/
    │       ├── images/
    │       └── sounds/
    │
    ├── src/
    │   ├── components/
    │   │   ├── Artifact.js
    │   │   ├── Culture.js
    │   │   ├── Game.js
    │   │   └── App.js
    │   ├── data/
    │   │   └── cultures.json
    │   ├── utils/
    │   │   ├── artifactGeneration.js
    │   │   ├── cultureGeneration.js
    │   │   └── narrativeGeneration.js
    │   └── index.js
    │
    ├── .gitignore
    ├── README.md
    ├── package.json
    └── webpack.config.js
```

```css
those-who-came-before/
│
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   └── [ComponentName].jsx
│   ├── context/
│   │   └── [ContextName].js
│   ├── hooks/
│   │   └── use[HookName].js
│   ├── styles/
│   │   └── [StyleFile].css
│   ├── utils/
│   │   └── [UtilityFunction].js
│   ├── App.jsx
│   ├── index.js
│   └── data/
│       ├── artefacts.json
│       └── cultures.json
├── .gitignore
├── README.md
├── package.json
└── webpack.config.js
```
