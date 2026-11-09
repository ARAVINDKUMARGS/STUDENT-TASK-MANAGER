# 🎓 StudyFlow — Student Task & Productivity OS

> **InternNova Week 6 Final Web Development Project**  
> A complete, professional, modern, responsive, and interactive Student Task & Productivity Management platform built exclusively using **Semantic HTML5, CSS3, and Vanilla JavaScript (ES6+)**. Zero external frameworks or heavy libraries.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/Vanilla%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://pages.github.com)

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features & Capabilities](#-key-features--capabilities)
3. [Folder & File Structure](#-folder--file-structure)
4. [Technologies Used](#-technologies-used)
5. [How to Run Locally](#-how-to-run-locally)
6. [Comprehensive Testing & Verification Checklist](#-comprehensive-testing--verification-checklist)
7. [Git Version Control & Meaningful Commit Flow](#-git-version-control--meaningful-commit-flow)
8. [Step-by-Step GitHub Pages Deployment](#-step-by-step-github-pages-deployment)
9. [Official 400–500 Word Capstone Project Report](#-official-400500-word-capstone-project-report)

---

## 🌟 Project Overview

**StudyFlow** is a modern SaaS-grade student productivity operating system engineered to help university and high school students track assignments, balance academic workloads, conquer deadlines, and execute distraction-free study sessions.

Unlike generic to-do apps, StudyFlow is tailored specifically to academic workflows:
- Tracks tasks with **Course / Subject tags**, **Priority levels** (Urgent, High, Medium, Low), and **Exact Due Dates**.
- Calculates visual **Urgency Indicators** (`Overdue by X days`, `Due Today`, `Due Tomorrow`, `Upcoming`).
- Features a **Science-Backed Pomodoro Focus Timer** directly linked to students' pending assignments with sound alerts synthesized through the browser's native **Web Audio API**.
- Computes a dynamic **Weekly Productivity Score** rendered via an animated **SVG Circular Progress Gauge** and horizontal workload distribution tracks.
- Stores 100% of data persistently in **LocalStorage**, allowing students to export/import JSON backups or restore sample demonstration coursework anytime.

---

## 🚀 Key Features & Capabilities

### 1. Modern SaaS Dashboard Layout
- **Collapsible Responsive Sidebar**: Features brand identity, student profile snippet, active streak counter (`🔥 5 Days`), main view links, and live course task counters.
- **Top Sticky Header**: Glassmorphic backdrop blur, live digital clock and date ticker, global search bar with keyboard shortcut hint (`/`), and quick task creation button.
- **Hero Welcome Banner**: Personalized student greetings, rotating motivational quote ticker, and one-click quick actions.

### 2. Full Task Management CRUD Engine
- **Create**: Modal dialog to add assignments with title, subject/course, priority level, status, due date/time, estimated focus blocks (1–8 Pomodoros), and study notes.
- **Read**: Dynamic rendering of assignments in either a **Grid Card View** or a compact **List View**.
- **Update**: Modal pre-populated with existing data; inline status updates via quick dropdowns; single-click complete checkbox.
- **Delete**: Protected deletion with a dedicated confirmation modal to prevent accidental data loss.
- **Batch Actions**: One-click "Clear Completed" button to purge finished assignments.

### 3. Real-Time Search, Multi-Filter & Sorting
- **Status Filter**: Switch between `All Tasks`, `Pending`, `In Progress`, and `Completed`.
- **Priority Filter**: Filter by `Urgent`, `High`, `Medium`, or `Low`.
- **Course / Category Filter**: Filter by courses (`Computer Science`, `Web Development`, `Mathematics`, `Physics`, `Exam Prep`, `Extracurricular`, `Personal`).
- **Live Search**: Instant case-insensitive search matching task title, description, and course name.
- **Sorting Options**: Sort by Due Date (Earliest / Latest), Priority (Urgent to Low), Title (A to Z), or Recently Added.
- **Active Filter Bar**: Highlights current filters with quick dismiss chips and a "Reset All Filters" button.

### 4. Productivity Visualizations
- **Circular SVG Progress Gauge**: Calculates exact task completion percentage with animated SVG stroke offset and student ranking badge (`Master Scholar`, `High Momentum`, `Building Pace`).
- **Workload Distribution by Course**: Dynamic horizontal progress bars illustrating the percentage allocation of tasks across subjects.
- **Priority Breakdown Badges**: Real-time counter pills for Urgent, High, Medium, and Low items.

### 5. Interactive Pomodoro Focus Timer
- **Three Scientific Intervals**: `Focus (25m)`, `Short Break (5m)`, and `Long Break (15m)`.
- **Circular SVG Countdown Dial**: Real-time visual time depletion ring.
- **Browser-Native Audio Chimes**: Synthesizes pleasant acoustic bell tones upon starting and completing focus sessions via the **Web Audio API** (no external mp3 files or network requests required).
- **Task Linker**: Links active focus sessions directly to pending assignments.
- **Daily Focus Tracker**: Tracks total daily Pomodoros (`🍅`) and focused minutes saved to LocalStorage.

### 6. Light / Dark Mode Theming
- Seamless toggle switch with sun/moon animated slider.
- High-contrast, WCAG-accessible slate/indigo dark theme.
- Automatically respects system preferences and persists selection in LocalStorage.

### 7. Form Validation & Toast Notification System
- Client-side validation prevents empty submissions or invalid dates.
- Animated, stacked toast alerts for Success, Info, Warning, and Danger actions with automatic countdown progress bars.

### 8. Keyboard Power-User Shortcuts
| Key | Action |
|:---:|:---|
| <kbd>N</kbd> | Open New Assignment Modal |
| <kbd>/</kbd> | Focus Global Search Input |
| <kbd>D</kbd> | Toggle Dark / Light Mode |
| <kbd>Space</kbd> | Start / Pause Pomodoro Timer |
| <kbd>Esc</kbd> | Close any active modal dialog |

---

## 📁 Folder & File Structure

```text
student-task-manager/
├── index.html              # Semantic HTML5 dashboard, forms, modals & timers
├── css/
│   └── style.css           # CSS3 variables, flexbox, grid, animations, dark mode
├── js/
│   └── script.js           # Vanilla JS: state, CRUD, filters, Pomodoro, storage
├── assets/
│   └── images/
│       ├── logo.svg        # Vector brand logo mark
│       ├── favicon.svg     # Browser tab favicon icon
│       └── empty-tasks.svg # Clean vector empty state graphic
├── screenshots/
│   └── README.md           # Visual gallery guidelines and screenshot specifications
└── README.md               # Complete project documentation & guide
```

---

## 🛠️ Technologies Used

- **HTML5**: Semantic tags (`<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<article>`, `<dialog>`, `<time>`), accessible ARIA attributes (`aria-modal`, `aria-label`, `aria-live`).
- **CSS3**:
  - CSS Custom Properties (Variables) for theming.
  - CSS Flexbox for navigation, headers, toolbars, and modal layouts.
  - CSS Grid for dashboard KPI metrics and responsive task cards.
  - Media queries targeting Mobile (<640px), Tablet (641px–1024px), and Desktop (>1025px).
  - SVG animation (`stroke-dasharray`, `stroke-dashoffset`).
  - Glassmorphic backdrop filters (`backdrop-filter: blur(12px)`).
- **Vanilla JavaScript (ES6+)**:
  - Clean modular architecture (State, StorageManager, TaskManager, PomodoroManager, ModalManager, ToastManager).
  - Array manipulation (`filter`, `map`, `reduce`, `sort`, `find`, `findIndex`).
  - DOM event handling, custom event delegation, and keyboard listeners.
  - HTML5 LocalStorage API for persistence, JSON export/import.
  - Web Audio API synthesizer for pure-JS acoustic feedback.

---

## 💻 How to Run Locally

Because StudyFlow uses standard web standards and relative paths, it runs seamlessly in any modern browser without complex build steps:

### Option 1: Direct File Opening
Double-click `student-task-manager/index.html` (or open it directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).

### Option 2: VS Code Live Server Extension (Recommended)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` and click **"Open with Live Server"**.
4. The application will launch at `http://127.0.0.1:5500/student-task-manager/index.html`.

### Option 3: Python Built-in HTTP Server
Run the following terminal command from the project root:
```bash
# Python 3
python -m http.server 8000
```
Then navigate to: `http://localhost:8000/student-task-manager/index.html`

---

## 🧪 Comprehensive Testing & Verification Checklist

Before submission, the application was thoroughly verified against the following test cases:

| Area | Test Case | Expected Result | Status |
|:---|:---|:---|:---:|
| **CRUD** | Create Task | Modal opens, validates inputs, adds task card, plays chime, shows success toast. | Pass ✅ |
| **CRUD** | Edit Task | Pre-fills current data, saves changes without creating duplicates, updates card. | Pass ✅ |
| **CRUD** | Delete Task | Opens confirmation dialog with target title, deletes task on confirm, updates metrics. | Pass ✅ |
| **CRUD** | Toggle Status | Checkbox updates card styling (strikethrough), increments/decrements completed counter. | Pass ✅ |
| **Filter** | Status Tabs | Clicking "In Progress" shows only active items; counter updates accordingly. | Pass ✅ |
| **Filter** | Course & Priority | Selecting "Computer Science" + "Urgent" narrows list to matching subset. | Pass ✅ |
| **Search** | Global Search | Typing "Calculus" or "Lab" filters list instantly; shows clear (×) button. | Pass ✅ |
| **Storage**| Persistence | Refreshing browser retains all created tasks, completed statuses, and theme mode. | Pass ✅ |
| **Storage**| Export / Import | Exports `.json` file; importing file restores exact task state. | Pass ✅ |
| **Timer**  | Pomodoro | Counts down 25:00 smoothly; updates SVG ring; plays Web Audio bell on completion. | Pass ✅ |
| **Responsive** | Mobile (<640px) | Sidebar folds into hamburger drawer; KPI cards stack into single column. | Pass ✅ |
| **Console**| Error Free | Zero console errors, warnings, or broken network assets. | Pass ✅ |

---

## 🐙 Git Version Control & Meaningful Commit Flow

Follow these terminal commands to initialize git, check file states, add changes, and commit with clean, conventional commit messages:

### Step 1: Initialize Git Repository
```bash
git init
```

### Step 2: Check Repository Status
```bash
git status
```
*(Confirms that `student-task-manager/index.html`, `css/style.css`, `js/script.js`, and `assets/` are tracked as untracked files).*

### Step 3: Stage All Files
```bash
git add .
```

### Step 4: Make Initial & Iterative Commits
```bash
# 1. Initial project skeleton
git commit -m "feat: initialize student task manager project structure with semantic HTML5"

# 2. Modern styling and design system
git commit -m "style: implement responsive SaaS layout, CSS Grid, Flexbox, and Light/Dark themes"

# 3. Core Task CRUD & LocalStorage persistence
git commit -m "feat(tasks): implement task CRUD, status toggle, search filters, and LocalStorage engine"

# 4. Pomodoro focus timer & analytics gauge
git commit -m "feat(productivity): add interactive Pomodoro timer with Web Audio chime and circular SVG progress gauge"

# 5. Documentation & assets
git commit -m "docs: finalize comprehensive README, test suite checklist, and capstone project report"
```

### Step 5: Inspect Commit History
```bash
git log --oneline --graph --decorate
```

### Step 6: Link to Remote GitHub Repository & Push
```bash
# Rename branch to main
git branch -M main

# Add your GitHub repository URL (replace YOUR-USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/student-task-manager.git

# Push code to GitHub
git push -u origin main
```

---

## 🌐 Step-by-Step GitHub Pages Deployment

Deploy your website online for free using GitHub Pages:

1. **Log in to GitHub** and create a new public repository named `student-task-manager`.
2. Push your project code to the repository following the Git commands above.
3. On your repository page, click on the **Settings** tab (gear icon at top).
4. In the left navigation menu, scroll down and click on **Pages**.
5. Under **"Build and deployment"**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main`.
   - **Folder**: Select `/(root)`.
   - Click **Save**.
6. Wait 1 to 2 minutes. Refresh the page to see your live URL:
   ```text
   https://YOUR-USERNAME.github.io/student-task-manager/
   ```
7. Verify that your website loads properly, all stylesheets and images display correctly, and LocalStorage operates as expected!

---

## 📝 Official 400–500 Word Capstone Project Report

### **Project Title**
**StudyFlow — Modern Student Task & Productivity Management Platform**

### **Objective**
The primary objective of this project was to design, develop, and deploy a professional, responsive, and interactive productivity dashboard tailored for modern academic learners, adhering strictly to core web fundamentals: **Semantic HTML5, CSS3, and Vanilla JavaScript (ES6+)** without third-party frameworks.

### **Overview**
StudyFlow solves the fragmentation students face when balancing multiple courses, high-stakes deadlines, and study habits. The application unites assignment tracking with an evidence-based Pomodoro focus timer and visual productivity analytics. It delivers a full SaaS-grade dashboard experience featuring a collapsible responsive sidebar, live digital clock, metric cards, dynamic search, multi-criteria filtering, dark/light mode toggles, and permanent LocalStorage persistence with JSON backup capabilities.

### **Technologies Utilized**
The project was built using 100% native web standards:
- **HTML5**: Semantic tags (`<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<article>`), accessible form controls, and ARIA attributes.
- **CSS3**: Custom properties (CSS variables) for seamless Light/Dark theming, CSS Flexbox, CSS Grid layouts, glassmorphism (`backdrop-filter`), keyframe animations, and mobile-first media queries.
- **Vanilla JavaScript**: ES6+ modules, arrays (`map`, `filter`, `reduce`, `sort`), objects, DOM event delegation, LocalStorage API, and browser-native Web Audio API frequency synthesis for acoustic session alerts.

### **Key Features**
1. **Full Task CRUD**: Add, edit, delete, and toggle assignments with course categories, urgency badges, due dates, and study notes.
2. **Search & Multi-Filtering**: Instant case-insensitive search with independent status, priority, and subject filter dropdowns.
3. **Productivity Visualizations**: Animated SVG circular progress ring indicating real-time completion score and subject workload distribution tracks.
4. **Interactive Pomodoro Timer**: 25m Focus, 5m Short Break, and 15m Long Break intervals linked directly to active student assignments.
5. **Theme & LocalStorage Persistence**: Immediate dark/light transitions and zero data loss on browser refresh.

### **Challenges & Solutions**
- *Challenge*: Creating an acoustic alert for the Pomodoro timer without external audio dependencies or network requests.  
  *Solution*: Implemented the native Web Audio API using an oscillator and gain node to synthesize a warm sine-wave bell tone entirely in JavaScript.
- *Challenge*: Keeping productivity analytics and course workload distribution synchronized across rapid CRUD operations.  
  *Solution*: Built a centralized state object and decoupled rendering pipeline that recalculates metrics and updates DOM nodes with minimal overhead.

### **Key Learnings**
This capstone solidified deep competence in semantic DOM manipulation, CSS layout algorithms (Grid and Flexbox), keyboard accessibility standards, clean state architecture, and Git version control workflows.

### **Future Improvements**
Future iterations could introduce weekly study goal reminders via the Web Notifications API, calendar month grid views, and study time analytics exported to PDF reports.

---

### **Project Links**
- **GitHub Repository**: [https://github.com/ARAVINDKUMARGS/STUDENT-TASK-MANAGER](https://github.com/ARAVINDKUMARGS/STUDENT-TASK-MANAGER)
- **Live Deployment**: [https://aravindkumargs.github.io/STUDENT-TASK-MANAGER/](https://aravindkumargs.github.io/STUDENT-TASK-MANAGER/)

---

*Developed with passion for InternNova Week 6 Final Web Development Capstone.*
