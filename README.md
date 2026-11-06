# Feronia Wildlife Facility Management Information System

Feronia is a comprehensive wildlife facility management and conservation information system designed with dedicated portals for Facility Administrators, Veterinarians, and Animal Keepers.

## Features

- **Administrator Portal**: Oversee animal census, enclosures, breeding records, inventory tracking, staff management, and financial/operational auditing.
- **Veterinarian Portal**: Manage clinical medical records, health checkup schedules, diagnostic logs, and treatment workflows.
- **Keeper Portal**: Track daily feeding routines, enclosure maintenance tasks, stock deductions, shift notes, and breeding observations.
- **Firebase Firestore Integration**: Real-time cloud synchronization, secure role-based access control, and persistent document storage.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

## Deploying to Render (Render.com)

This project is pre-configured with `render.yaml` for zero-configuration deployment on Render.

### Method 1: Using Render Blueprint (Automatic)
1. Push this project to your GitHub repository.
2. In your [Render Dashboard](https://dashboard.render.com), click **New +** $\rightarrow$ **Blueprint**.
3. Connect your repository. Render will automatically read `render.yaml` and configure the Web Service with:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Health Check:** `/api/health`
4. Click **Apply**. Your app will be live within 2-3 minutes.

### Method 2: Manual Web Service
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Select your GitHub repository.
3. Choose:
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** `Free`
4. Click **Deploy Web Service**.
