---
trigger: always_on
---

# ANTIGRAVITY IDE - CORE DIRECTIVES FOR STUDENTSPEND (STATIC-FIRST & UI MIRROR)

## 1. Workflow & Implementation Standards
- **Always Create a Plan for Major Implementation:** Before writing any code, output a step-by-step Implementation Plan detailing the tasks, components to build, and file structure.
- **For smaller code fixex, small optimization or implementations:** No need to create implementation plan, proceed directly.
- **Wait for Approval:** Continue step-by-step and ALWAYS wait for user approval before moving to the next step, installing libraries, modifying configs, or generating multiple files.
- **Generate File-by-File:** Present code separately for each component, labeled with its exact file name and path. Never combine unrelated files.
- **No Hallucination:** Use only latest stable React Native standards and official APIs. Never invent packages, hooks, methods, or native modules.

## 2. UI Translation: Exact Pixel-Perfect Replications
- **The Golden Rule:** The final native UI components must be exact 1:1 duplicates of the HTML layouts, aesthetics, and colors found in the `stitch` folder. Read the `design.md` carefully.
- **HTML to TypeScript Elements:** Translate web semantic structures (`div`, `span`, `button`) into appropriate native primitives (`View`, `Text`, `Pressable`, `TouchableOpacity`).
- **Glassmorphic Fidelity:** CSS `backdrop-filter: blur` MUST be accurately duplicated using `<BlurView>` from `@react-native-community/blur`. Translate `linear-gradient` to `react-native-linear-gradient`.
- **Formatting:** ALL time values displayed in the UI or processed in code logic must strictly use the 24-hour format (e.g., 14:30). Never use AM/PM.

## 3. Navigation & Interaction Routing Architecture
Implement React Navigation strictly following this state machine logic using mock data.

**A. Root Stack (Cold Install / Warm Boot)**
- `Splash Screen`: Renders first. Auto-transitions after 2s. 
  - *Logic Check*: If mock state `isLoggedIn == false`, route to `Login Screen`. If `true`, route to `Biometric Gate`.
- `Login Screen`: "Continue with Google" button routes -> `Initial Setup Wizard`.
- `Initial Setup Wizard`: "Finish Setup" button initializes mock MMKV and routes -> `Main App (Tab 1)`.
- `Biometric Gate`: "Scan" action routes -> `Main App (Tab 1)`.

**B. Main Tabs (Bottom Tab Navigator)**
- `Tab 1 (Home Dashboard)`: Shows mock user "Aqua", balance cards, and recent transactions.
- `Tab 2 (Statistics)`: Shows spending graphs and month toggles.
- `Tab 3 (AI Assistant)`: Chat UI. Mock input "What did I spend on Food?" returns filtered list.
- `Tab 4 (Settings)`: Profile details and CSV export buttons.

**C. Global Overlays & Deep Links**
- **The FAB Modal (Action Menu):** The global `+` FAB on the Dashboard must trigger a Bottom-Sheet modal to slide up (blurring the background).
  - *Log Payment / Add Funds / Self-Transfer*: Tapping "Save" inside the modal dismisses the sheet and instantly updates the mock UI balances and lists.
- **Transaction Detail (Push Navigation):** Tapping any specific transaction card in Tab 1 slides to a `Transaction Detail Screen`.
  - *Refund Action*: Tapping "Mark as Refunded" triggers a pop navigation back to Tab 1, showing the mock balance credited back.