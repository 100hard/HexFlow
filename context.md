You are helping build a take-home assignment called NextFlow.

Project Overview:

Build a simplified clone of the Galaxy.ai workflow builder.

This is NOT a full Galaxy/Magica clone.

Only 3 pages exist:

1. Authentication (Clerk)
2. Dashboard
3. Workflow Canvas

The Dashboard UI is already completed.

Current Status:

* Dashboard exists
* Workflow listing UI exists
* Create workflow UI exists
* Open workflow action exists
* We are now building the Workflow Canvas page

Tech Stack:

* Next.js App Router
* TypeScript (strict)
* Tailwind CSS
* shadcn/ui
* React Flow
* Zustand
* Prisma
* PostgreSQL
* Trigger.dev
* Gemini 3.1 Pro

Workflow Canvas Requirements:

The canvas is the most important page.

Must visually resemble Galaxy.ai workflow editor.

Required features:

* React Flow
* Dot grid background
* Pan
* Zoom
* Fit View
* MiniMap
* Animated edges
* Custom nodes
* Floating add-node toolbar
* Run button
* Workflow history panel

Only 4 node types exist:

1. Request Inputs
2. Crop Image
3. Gemini 3.1 Pro
4. Response

Request Inputs and Response are automatically placed on every new workflow and cannot be deleted.

Users may only add:

* Crop Image
* Gemini 3.1 Pro

Initial workflow should render:

Request Inputs → Response

Workflow Layout:

Main area contains React Flow canvas.

Top area contains:

* Workflow name
* Back button
* Run button

Bottom center contains:

* Floating + button

Bottom right contains:

* MiniMap

Future Features (Do Not Implement Yet):

* Database persistence
* Gemini execution
* Trigger.dev execution
* History persistence
* Export/Import

Current Goal:

Build only the visual Workflow Canvas page with React Flow.

No backend.

No API calls.

No execution engine.

No database.

Use mock data only.

Focus entirely on:

* Layout
* Visual fidelity
* Component architecture
* React Flow integration

Produce clean, maintainable code suitable for future extension.
