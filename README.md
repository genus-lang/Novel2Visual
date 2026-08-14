# Novel2Visual

Novel2Visual is a powerful Chrome Extension that acts as an automated pipeline for generating cinematic illustrations based on novel chapters. It intelligently parses chapters from your active browser tab, extracts key scenes, and fully automates the Google Gemini UI to generate a cohesive gallery of images for the chapter.

## 🚀 Features

- **Automated Scene Extraction**: Parses standard web-based novels to detect and extract scenes based on character interactions, locations, and dialogue.
- **Smart Scene Scoring**: Ranks extracted scenes by importance (1 to 5) so you can focus on generating images for pivotal moments.
- **Background Queue System**: Features a robust, lock-managed background queue that systematically processes scenes one-by-one.
- **Gemini UI Automation**: Interacts directly with the Gemini web interface via Content Scripts. It automatically types prompts, presses submit, and securely extracts the resulting images.
- **Intelligent Duplicate Prevention**: Uses advanced DOM and Blob URL tracking to ensure Gemini is actually generating new images before continuing the queue.
- **Interactive Side Panel**: View your generated scenes, monitor live generation progress, manage the queue, and delete or regenerate specific images.
- **Batch Export**: Download all generated scenes for a chapter as an organized `.zip` file with a single click.

## 🛠️ Architecture & Tech Stack

- **React & TypeScript**: The UI (Sidepanel) is built with React and heavily utilizes standard React hooks and Zustand for state management.
- **Vite**: Superfast build tooling for the extension bundle.
- **Zustand**: Cross-component and background-sync state management for the generation queue.
- **Chrome Extension API**: Heavy usage of Chrome's `sidePanel`, `runtime.sendMessage`, and `tabs.sendMessage` for inter-process communication between the UI, the Service Worker, and Content Scripts.

### Directory Structure

```
src/
├── background/       # Chrome Extension Service Worker (manages the queue and cross-tab communication)
├── content/
│   ├── gemini/       # Content scripts injected into gemini.google.com to automate generation
│   └── novel/        # Content scripts injected into novel pages to parse text
├── core/             # Business logic (Prompt builders, Scene extractors, Character consistency)
├── services/         # Messaging layers and external integrations
├── sidepanel/        # React UI for the Chrome Side Panel
├── store/            # Zustand state stores (generationStore, settingsStore)
└── types/            # TypeScript interfaces
```

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Novel2Visual
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```
   *This will compile everything into the `dist/` directory.*

4. **Load into Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** in the top right corner.
   - Click **Load unpacked** and select the `dist/` folder that was just generated.

## 🎮 Usage

1. **Open a Novel Chapter**: Navigate to a webpage containing a novel chapter you want to visualize.
2. **Open the Side Panel**: Click the Novel2Visual extension icon to open the Chrome side panel.
3. **Extract Scenes**: Click the "Extract Chapter" button. The extension will parse the page and break it down into scenes.
4. **Prepare Gemini**: Open a new tab to [gemini.google.com](https://gemini.google.com) and ensure you are logged in. The side panel should show a green "Gemini Connected" indicator.
5. **Start Generating**: Click "Generate Missing" or enqueue individual scenes. The extension will take over the Gemini tab, typing prompts and extracting the generated images back to your side panel!
6. **Export**: Once finished, click "Download ZIP" in the Gallery tab to download your images.

## 🔧 Troubleshooting

- **"You stopped this response" Error**: If Gemini stops generating mid-scene, it usually means the text in that specific scene triggered Google's internal safety/content filters. The extension will safely skip it and move to the next scene. You can manually tweak the prompt in the extension and click "Regen" to try again.
- **Stuck Queue**: If the queue ever gets stuck, ensure your Gemini tab is still open and active. You can clear the queue or refresh the extension to reset the state.

## 📝 License
MIT License
