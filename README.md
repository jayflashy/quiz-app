# Multi-Subject Quiz Application

A premium, feature-rich quiz platform built with Vue 3, featuring dynamic subject loading, persistent history tracking, and a sleek dark mode interface.

## 🚀 Features

- **Multi-Subject Support**: Dynamically loads quiz questions from JSON files.
- **Persistent Progress**: Scores and exam history are saved to `localStorage`.
- **Detailed Results**: Immediate feedback with score breakdown and percentage.
- **Review Mode**: Review missed and unattempted questions with correct answers highlighted.
- **Testing History**: Dedicated history dashboard with search and filtering capabilities.
- **Dark Mode**: Built-in dark mode support with a floating toggle.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Lucide Icons**: Integrated professional iconography for a premium feel.

## 🛠️ Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Routing**: [Vue Router 4](https://router.vuejs.org/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Vue Next](https://lucide.dev/guide/packages/lucide-vue-next)
- **Tooling**: [Vite](https://vitejs.dev/)

## 📁 Project Structure

```text
src/
├── assets/         # CSS and static assets
├── data/           # Subject-specific JSON data (e.g., economics.json)
├── router/         # Vue Router configuration
├── stores/         # Pinia state stores
├── views/          # Page components (Home, Subjects, Quiz, Results, History)
└── App.vue         # Main layout wrapper
```

## ⚙️ Project Setup

### Installation

```sh
pnpm install
```

### Development

```sh
pnpm dev
```

### Production Build

```sh
pnpm build
```

## 📝 Adding New Subjects

To add a new subject to the app:

1. Create a `[subjectId].json` file in `src/data/`.
2. Follow the existing schema in `economics.json`.
3. Add the subject to the `subjects` array in `src/views/SubjectsView.vue`.
