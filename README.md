# Deterministic UI Generator Agent

An AI-powered agent that converts natural language into working UI code using a strictly deterministic component system. Built with React, Node.js, and Google Gemini.

## Quick Start

1.  **Clone the repo**
2.  **Server Setup**:
    ```bash
    cd server
    npm install
    # Create .env file with your GEMINI_API_KEY and PORT
    npm run dev
    ```
3.  **Client Setup**:
    ```bash
    cd client
    npm install
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.

## Note:

Currently used model gemini 2.5-flash is not accepting render location which causing error in deployed link, so please try on local system.

## Features

- **Global Font**: 'Inter' for better readability.
- **Enhanced UI**: Modern Chat and Preview panels with consistent alignment.
- **Smart Error Handling**: User-friendly messages for API limits.
- **Deployment Ready**: Includes `render.yaml` for easy deployment.

## Architecture

This project implements a multi-step workflow:

1.  **Planner**: Receives user intent and outputs a strict JSON plan using only allowed components.
2.  **Generator**: Deterministic function that converts the JSON plan into React JSX code.
3.  **Explainer**: Analyzes the plan and explains the design decisions.

## Component System

The AI can only compose these pre-defined blocks:

*   **Atoms**: `Button`, `Input`, `Typography`, `Image`, `Icon`.
*   **Molecules**: `Card`, `Modal`, `Alert`, `Table`, `Chart`.
*   **Layouts**: `Container`, `Grid`, `Flex`, `Sidebar`, `Navbar`.

All styles are defined in `components.css` and are immutable.

## Limitations

*   **No State Logic**: The generated UI is purely presentational.
*   **Limited Customization**: Colors/fonts are fixed to ensure design consistency.
