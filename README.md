# InSpectrum Frontend

🚀 **Live Demo:** [https://inspectrum.up.railway.app](https://inspectrum.up.railway.app)

## Description
This is the frontend application for the InSpectrum platform. It provides an intuitive, responsive, and accessible user interface for parents and educators to assess specific needs, generate personalized learning plans, view educational resources, and seamlessly track progress over time.

## Tech Stack
- **React**: Component-based UI library.
- **TypeScript**: Static typing for robust code and better developer experience.
- **Vite**: Ultra-fast frontend build tool and development server.
- **React Router**: Declarative routing for navigating between application views.
- **TanStack Query (React Query)**: Powerful asynchronous state management and server state fetching.
- **Axios**: Promise-based HTTP client for making API requests.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI styling.
- **React Hook Form**: Performant, flexible, and extensible forms.
- **Zod**: TypeScript-first schema declaration and input validation.

## Features
- **Authentication**: Secure user registration and login workflows for different user roles (Parents and Educators).
- **Assessment Flow**: Dynamic questionnaire to evaluate specific needs and determine the most effective strategies.
- **Plan Generation**: Automatic creation of personalized learning and action plans based on assessment results.
- **Resource Details**: Access to a curated library of educational resources, guides, and practical materials.
- **Progress Tracking**: Daily or weekly entry logging to monitor adherence to the plan and observe outcomes.
- **Profile Management**: Capabilities to manage user account details and personal preferences.

## Architecture Highlights
- Centralized API client with Axios interceptors (auth + error handling)
- React Query used for server state management with caching strategy
- Global error handling via toast notifications
- Form validation handled with Zod + React Hook Form
- User-specific query isolation to prevent data leakage between sessions

## Project Structure
A brief overview of the main directories in `src/`:
- `api/`: Centralized Axios client, OpenAPI type definitions, and backend communication services.
- `assets/`: Static assets such as images and global generic styles (`index.css`).
- `auth/`: Authentication context provider, custom hooks, and session management logic.
- `components/`: Reusable UI components including shared layouts, inputs, and forms.
- `lib/`: Shared utilities, generalized configurations, and common validation schemas.
- `pages/`: Top-level page components (`LoginPage`, `PlanPage`, etc.) corresponding to specific routes.

## Media Handling (MVP)

For the MVP, video resources are served from local static files stored in `public/videos`.
The frontend uses a mapping (see `src/lib/videoMapping.ts`) to match resource titles to local video
files and render them using the HTML5 `<video>` player. If no local match is found, the application 
falls back to external video links (e.g., YouTube). This approach allows fast development without 
backend media storage and can be replaced later with backend-driven URLs.

## Local Setup
To run this project locally, ensure you have Node.js installed, then execute the following commands:

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev
```

## Environment Variables
Create a `.env` file in the root directory (or use `.env.local` for local development) to configure environment-specific settings. Ensure the backend server is running on the corresponding port.

```env
VITE_API_URL=http://localhost:8080
```

## Production Build
To test or prepare the application for production deployment, run the following command. This will output the optimized static assets into the `dist/` directory.

```bash
npm run build
```

## Main User Flow
The primary application lifecycle for a typical user follows this sequence:
**Register / Login** → **Complete Assessment** → **Generate Personalized Plan** → **View Plan & Resources** → **Track Process & Add Logs** → **Update User Profile**

## Notes
- Built as an MVP with focus on clean architecture, scalability, and user experience