# NextFlow 

**NextFlow** is an interactive workflow canvas and automation dashboard inspired by the architecture of platforms the Platform *Galaxy.ai*. 

Built on a robust Next.js serverless framework and dynamic React Flow layout canvas, it enables developers and creators to design, configure, execute, and monitor complex AI pipeline graphs seamlessly.

---

## Submission Links

*   **Live Demo URL:** [https://nextflow-one-pi.vercel.app](https://nextflow-one-pi.vercel.app)
*   **Walkthrough & Demo Video:** [Google Drive Walkthrough](https://drive.google.com/file/d/1Arun1eGecyj95KcQ0_WYoRthiDIDlxdU/view?usp=drivesdk)
*   **Private GitHub Repo:** [https://github.com/100hard/nextflow](https://github.com/100hard/nextflow) *(Access granted to: `bluerocketinfo@gmail.com`)*

---

## Features & Capabilities

### 1. User Authentication & Guardrails
*   **Full Session Integration:** Secure access paths protected using **Clerk Middleware** on all dashboard endpoints and workspace routes.
*   **Seamless Auth Lifecycles:** Elegant custom login, session token validation, and account state syncing.

### 2. Interactive Workspace Canvas & Building Blocks
*   **Dynamic Custom Nodes:** Drag, connect, configure, and execute four granular node architectures:
    *   **Request-Inputs:** Dynamic input parameters (e.g. `image_field`) for execution ingestion.
    *   **Crop Image:** Aspect-ratio adjustments and crop operations.
    *   **Gemini 3.1 Pro:** Rich text and multiline LLM generative prompt processors.
    *   **Response:** Final execution output hubs.
*   **Micro-Animations & Visual State Indicators:** Pulse animations, glow outlines, run loaders, and glowing transition lines dynamically highlight current canvas execution routes.

### 3. Transloadit Image Upload Integration
*   **Zero-Delay Local Uploads:** Interactive file-select handlers built directly inside the `Request-Inputs` node interface, supporting image file previews and immediate file system synchronization.

### 4. Advanced Graph Execution Schemes
*   **End-to-End Run:** Pulses connection paths and schedules node outputs in logical execution order.
*   **Single-Node Run:** Granular, isolated play execution triggering from inside individual nodes (with full loaders and active state highlights).
*   **Multi-Select Run:** Execute specific subsets of connected node graphs.

### 5. Detailed Run History & Auditing
*   **Granular Trace Audit logs:** The slide-out history panel lists all historical executions, scoped beautifully by **`FULL`**, **`SINGLE`**, or **`PARTIAL`** runs.
*   **Expandable Diagnostics:** Expand execution traces to inspect parameters, connection values, runtimes, and exact inputs/outputs.

### 6. Portability (JSON Export & Import)
*   **Dynamic Workspaces:** Export canvas workflows to lightweight, structured JSON files.
*   **Configuration Hydration:** Import files to instantly recreate the entire canvas configuration, complete with custom node titles, parameters, coordinates, and edge bounds.

---

## Architecture & Tech Stack

*   **Frontend Framework:** Next.js 15 (App Router, Webpack engine)
*   **Interactive Canvas:** `@xyflow/react` (React Flow layout controller)
*   **Database:** Neon PostgreSQL (Serverless database connection)
*   **ORM Layer:** Prisma 7.8.0 (Modern type-safe schema compilation)
*   **Identity Services:** Clerk Auth Core (`@clerk/nextjs`)
*   **Styling & Motion:** TailwindCSS, CSS Variables, micro-animations
*   **Icons Framework:** Lucide React

---

## How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/100hard/nextflow.git
cd nextflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Local Environment Variables
Create a `.env.local` or `.env` file in the project's root:
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
DATABASE_URL=YOUR_NEON_POSTGRESQL_CONNECTION_STRING
DIRECT_URL=YOUR_NEON_POSTGRESQL_DIRECT_CONNECTION_STRING
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
```

### 4. Initialize Database Client
Generate the type-safe client schemas locally:
```bash
npx prisma generate
```

### 5. Launch Development Server
```bash
npm run dev
```
Open `http://localhost:3001` (or your terminal's active dev port) in your browser!

---

## Build Validation
This project is configured to run `prisma generate` before Next.js compiles, making it fully deployment-ready. The build executes flawlessly with exit status `0`:
```bash
npm run build
```
