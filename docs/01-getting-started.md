# Getting Started

This guide will help you set up the Roogo Fitness project on your local machine for development and testing purposes.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed (v18.19.0 or higher is recommended for Angular v21).
- **Package Manager**: This project strictly uses `pnpm` (v11+).

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd roogo-fitness
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

## Development Server

To start the local development server, run:

```bash
pnpm start
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Initial Data Seeding

The application uses an **offline-first approach** powered by IndexedDB. 
Upon first load, the application's `DbService` will automatically initialize the IndexedDB (`RoogoFitnessDB`) and seed it with mock data for muscles, exercises, workout plans, and sample logged sessions if the database is empty. You do not need to run any manual migration scripts.

## Building for Production

To build the project for production, run:

```bash
pnpm build
```
The build artifacts will be stored in the `dist/` directory.

## Linting and Formatting

We use Prettier for code formatting. To format your code before committing, you can typically rely on your IDE's format-on-save feature or run the formatting script (if defined in `package.json`).
