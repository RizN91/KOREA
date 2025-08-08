# Fridge Seal Manager

A production-quality web application for managing fridge-seal jobs end-to-end, inspired by Tradify but streamlined for fridge-seal technicians.

## Features

- **Dashboard**: KPIs, charts, and quick actions
- **Job Management**: Full lifecycle from New → Paid with status workflow
- **Kanban Board**: Drag & drop job status updates
- **Scheduler**: Calendar/map view with drag-to-schedule
- **Customer & Site Management**: Complete CRUD operations
- **Quotes & Invoices**: PDF generation with GST calculations
- **Parts/Inventory**: Stock management and pricing
- **Mobile-First Tech View**: Optimized for field technicians
- **Dark Mode**: Toggle and persistent preference
- **Role-Based Access**: Admin, Scheduler, Tech permissions
- **Global Search**: Across jobs, customers, sites
- **PDF Generation**: Labels, quotes, invoices
- **Keyboard Shortcuts**: Power user functionality

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom design system
- **State Management**: Zustand
- **Routing**: React Router v6
- **UI Components**: Headless UI + Hero Icons
- **Data Persistence**: IndexedDB (via idb library)
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **Drag & Drop**: @dnd-kit
- **Search**: Fuse.js for fuzzy search

## Quick Start

```bash
# Install dependencies and start development server
npm i && npm run dev
```

The app will be available at http://localhost:3000

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── store/              # Zustand state management
├── services/           # API layer and database mock
├── types/              # TypeScript interfaces
├── utils/              # Utility functions
└── hooks/              # Custom React hooks
```

## Default Login

- **Admin**: Brett (shortCode: "FS")
- **Scheduler**: Jess (shortCode: "JS") 
- **Tech**: Mark (shortCode: "MK")

## Keyboard Shortcuts

- `N`: New Job
- `/`: Focus Search
- `G + J`: Go to Jobs
- `G + D`: Go to Dashboard
- `Esc`: Close modals/dialogs

## Demo Data

The app comes with 25+ customers, 45+ jobs across all statuses, realistic Australian addresses (Melbourne/VIC), and comprehensive parts catalog with common profiles (RP423, RP215, etc.).

## Build

```bash
npm run build
```

## Features in Detail

### Job Status Workflow
New → Need to Measure → Measured → Quoted → Waiting Approval → Approved → In Production → Ready for Install → Scheduled → In Progress → Completed → Invoiced → Paid

### Measurements System
- A-size (width) and C-size (height) inputs
- No B-size per business requirements
- Profile code suggestions based on measurements
- Colour selection (Black/Grey)
- Gasket type selection

### Smart Features
- Auto-generated job numbers (JB####)
- Travel time estimation
- Optimal route suggestions
- Low stock alerts
- Photo capture and annotation
- QR code generation for jobs

Built with ❤️ for fridge-seal professionals.