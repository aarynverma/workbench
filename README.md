# Jupyter Notebook Workbench

A modern React-based UI for interacting with Jupyter notebooks, featuring a clean interface with notebook and cell management, real-time code execution, and drag-and-drop functionality.

## Features

- Create and manage multiple notebooks
- Add, delete, and reorder code cells
- Drag-and-drop cell reordering
- Execute code cells with real-time output display
- Virtualized cell list for optimal performance
- Clean and intuitive UI with Tailwind CSS

## Tech Stack

- **Framework**: React with TypeScript
- **State Management**: Zustand
- **Server State**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Drag & Drop**: dnd-kit
- **Virtualization**: react-window

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose for running the Jupyter backend

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/jupyter-notebook-workbench.git
cd jupyter-notebook-workbench/workbench
```

2. Install dependencies:

```bash
npm install
```

or if you use yarn:

```bash
yarn install
```

## Running the Application

### 1. Start the Jupyter Backend Server (Docker)

Navigate to the jupyter-backend-docker/basic-example directory:

```bash
cd ../jupyter-backend-docker/basic-example
```

Start the Docker containers:

```bash
docker-compose up -d
```

This will start a JupyterHub server on http://localhost:8000.

### 2. Start the React Frontend

Return to the workbench directory:

```bash
cd ../../workbench
```

Start the development server:

```bash
npm start
```

or with yarn:

```bash
yarn start
```

The application will start and be available at http://localhost:3000.

## Using the Application

1. **Create a Notebook**: Enter a name and click "Add" in the sidebar.
2. **Add Cells**: Click the "+ Add Cell" button in a notebook.
3. **Edit Code**: Type Python code in any cell.
4. **Run Cells**: Click the "Run" button on a cell to execute it.
5. **Reorder Cells**: Drag and drop cells using the handle on the left side.
6. **Delete Cells**: Click the "Delete" button on a cell.

## Default Jupyter Token

The application is preconfigured with a token for accessing the JupyterHub API. This token is set to:

```
f89d68d1fdd54ce48fff0bb3d629b5e6
```

This token is used for authentication with the JupyterHub server running in Docker.

## Project Structure

- `src/components/`: React components
- `src/store/`: Zustand state management
- `src/utils/`: Utility functions, including Jupyter API interactions
- `public/`: Static assets
- `jupyter-backend-docker/`: Docker setup for Jupyter backend

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
