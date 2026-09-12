# HexFlow

A visual creative workflow layer for HexCoded.

HexFlow explores how creative work could become easier to change, branch and iterate on without rebuilding everything from scratch.

**Live prototype:** https://hex-flow-lemon.vercel.app/

**Product case study:** [https://app.notion.com/p/sauhard1912/HexFlow-3d94a91adc258051bf46c4e13e0bc0cd?source=copy_link]

---

## The idea

HexCoded makes it easy to go from an idea to finished content by handling much of the technical complexity.

But creative work is rarely linear.

After seeing a result, I might want to change the actor, try a different hook, or explore another visual setting while keeping the rest of the work intact.

HexFlow makes those creative decisions visible as a workflow and tracks what actually needs to change.

> **Change one creative decision. Regenerate only what depends on it.**

---

## What HexFlow explores

### Creative workflows

Nodes represent meaningful creative decisions and steps rather than individual AI models or technical operations.

For example:

`Product → Hook → Script → Actor + Setting → Video`

This makes the parts of the creative process that a user might want to change directly visible and editable.

### Selective regeneration

HexFlow tracks dependencies between nodes.

If the actor changes, the video becomes stale while the script remains intact.

If a hook changes, the affected script and downstream video become stale.

Running the workflow brings only the affected work up to date instead of regenerating everything.

### Branching and exploration

Creative ideas often need to be explored in parallel.

A single product can branch into different hooks, scripts or visual directions while keeping each version independent.

### Agentic workflow editing

The canvas can also be controlled through natural language.

For example:

> "Create two UGC concepts with different hooks."

or:

> "Change the second hook to Before / After."

The agent translates the request into changes on the canvas while keeping the resulting workflow visible and editable.

**Agent for intent. Canvas for structure and control.**

---

## Prototype examples

### 01 / CHANGE

**Swap the actor, keep the creative.**

Change the actor and only the affected downstream work becomes stale.

### 02 / EXPLORE

**Which hook works better?**

Branch from the same product and explore different creative directions without losing either version.

### 03 / ITERATE

**Same idea. Two visual worlds.**

Keep the same voice and message while exploring different aesthetic settings.

---

## What is actually implemented

The prototype includes a functional workflow engine with:

- Typed node connections
- Dependency tracking
- DAG execution
- Topological ordering
- Cycle detection
- Stale state propagation
- Selective execution
- Content-based state comparison
- Workflow persistence
- Run history
- Undo and redo
- Natural language workflow creation and modification
- Multiple prototype workflows

The workflow engine preserves valid results and only reruns work whose inputs or configuration have changed.

---

## Prototype limitations

The actual AI generation and video rendering are simulated in this prototype.

The goal was to explore the product direction, workflow interaction model and dependency behaviour rather than reproduce HexCoded's generation infrastructure.

There is also significant room to improve the implementation before this could become a production system. The prototype is intended to demonstrate the direction and core interaction model.

---

## Built with

**Next.js · React · TypeScript · React Flow**

---

## Background

HexFlow was built by extending a workflow engine I had previously developed and applying it to the creative workflow problem explored here.

The earlier foundation provided the canvas, workflow execution and state management needed to explore the new product direction.

---
## Running locally

### 1. Clone the repository

```bash
git clone https://github.com/100hard/HexFlow.git
cd HexFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file with the required environment variables.

```env
OPENAI_API_KEY=your_key_here
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production

```bash
npm run build
```

---

## Why I built this

This prototype started from a simple question:

> If a creator wants to change one part of AI-generated content, why should they have to start over?

HexFlow is an exploration of what happens when the creative process itself becomes visible, editable and aware of its dependencies.


