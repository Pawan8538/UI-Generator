# Deterministic UI Generator Agent

An AI-powered agent that converts natural language into working UI code using a strictly deterministic component system. Built with React, Node.js, and Google Gemini.

## Quick Start

1.  **Clone the repo**
2.  **Server Setup**:
    ```bash
    cd server
    npm install
    # Create .env file with your GEMINI_API_KEY
    cp .env.example .env
    npm run dev
    ```
3.  **Client Setup**:
    ```bash
    cd client
    npm install
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

## Changes & Features

- **Global Font**: Updated to 'Inter' for better readability.
- **Enhanced UI**: Improved Chat and Preview panels with modern styling and consistent alignment.
- **Smart Error Handling**: User-friendly messages for API limits and quotas (e.g., 429 errors).
- **Deployment Ready**: Includes `render.yaml` for easy deployment on Render.

## Architecture

This project implements a multi-step agentic workflow to ensure safety, correctness, and determinism.

### The Pipeline
1.  **Planner (The Architect)**:
    *   Receives user intent + conversation history.
    *   Outputs a strict JSON plan validated against a schema.
    *   Constraint: Can ONLY use components from the `componentRegistry`.
2.  **Generator (The Builder)**:
    *   Deterministic Function (No AI).
    *   Converts the JSON plan into React JSX code.
    *   Guarantees that the output code is valid and uses only allowed props.
3.  **Explainer (The Guide)**:
    *   Analyzes the plan and explains the design decisions to the user.

### Project Structure
*   `/client`: Vite + React frontend.
    *   `src/components`: The Fixed Component Library. These components are immutable.
    *   `src/panels`: The 3-panel layout (Chat, Code, Preview).
    *   `src/App.jsx`: Main state manager.
*   `/server`: Node.js + Express backend.
    *   `src/agent`: Core agent logic (`planner.js`, `generator.js`, `explainer.js`).
    *   `src/routes`: API endpoints.

## Component System

The AI cannot create new components or arbitrary styles. It can only compose these pre-defined blocks:
*   **Atoms**: `Button`, `Input`, `Typography`, `Image`, `Icon`.
*   **Molecules**: `Card`, `Modal`, `Alert`, `Table`, `Chart` (mocked).
*   **Layouts**: `Container`, `Grid`, `Flex`, `Sidebar`, `Navbar`.

All styles are defined in `components.css` and are immutable.

## Safety & Determinism

*   **Whitelist Enforcement**: The `Generator` silently discards any component not in the `ALLOWED_COMPONENTS` list.
*   **Prop Validation**: The `Planner` is prompted with strict type definitions for every prop.
*   **Sandboxed Preview**: The live preview runs in a scoped environment (using Babel standalone) where only the fixed components are available. No external scripts or styles can be injected.

1.  **Clone the repo**
2.  **Server Setup**:
    ```bash
    cd server
    npm install
    # Create .env file with your GEMINI_API_KEY
    cp .env.example .env
    npm run dev
    ```
3.  **Client Setup**:
    ```bash
    cd client
    npm install
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

## 🏗️ Architecture

This project implements a multi-step agentic workflow to ensure safety, correctness, and determinism.

### The Pipeline
1.  **Planner (The Architect)**:
    *   Receives user intent + conversation history.
    *   Outputs a **strict JSON plan** validated against a schema.
    *   *Constraint*: Can ONLY use components from the `componentRegistry`.
2.  **Generator (The Builder)**:
    *   **Deterministic Function** (No AI).
    *   Converts the JSON plan into React JSX code.
    *   Guarantees that the output code is valid and uses only allowed props.
3.  **Explainer (The Guide)**:
    *   Analyzes the plan and explains the design decisions to the user.

### Project Structure
*   `/client`: Vite + React frontend.
    *   `src/components`: The **Fixed Component Library**. These components are immutable.
    *   `src/panels`: The 3-panel layout (Chat, Code, Preview).
    *   `src/App.jsx`: Main state manager.
*   `/server`: Node.js + Express backend.
    *   `src/agent`: Core agent logic (`planner.js`, `generator.js`, `explainer.js`).
    *   `src/routes`: API endpoints.

## 🧩 Component System (The "Lego Blocks")

The AI cannot create new components or arbitrary styles. It can only compose these pre-defined blocks:
*   **Atoms**: `Button`, `Input`, `Typography`, `Image`, `Icon`.
*   **Molecules**: `Card`, `Modal`, `Alert`, `Table`, `Chart` (mocked).
*   **Layouts**: `Container`, `Grid`, `Flex`, `Sidebar`, `Navbar`.

All styles are defined in `components.css` and are immutable.

## 🛡️ Safety & Determinism

*   **Whitelist Enforcement**: The `Generator` silently discards any component not in the `ALLOWED_COMPONENTS` list.
*   **Prop Validation**: The `Planner` is prompted with strict type definitions for every prop.
*   **Sandboxed Preview**: The live preview runs in a scoped environment (using Babel standalone) where only the fixed components are available. No external scripts or styles can be injected.

## ⚠️ Known Limitations

*   **No State Logic**: The generated UI is purely presentational. Buttons align and look right, but don't "do" anything (like submitting forms).
*   **Limited Customization**: You cannot change colors/fonts outside of the pre-defined variants (e.g., `variant="primary"`). This is by design.
*   **Context Window**: Extremely long conversations might hit the token limit of the LLM.

## 🔮 Future Improvements

With more time, I would add:
1.  **Streaming Responses**: Stream the plan generation for lower latency.
2.  **Component Schema Validation**: Use stricter Zod schemas for every prop to prevent type errors.
3.  **Theme Support**: Allow switching the `components.css` theme (e.g., Dark/Light mode) globally.
