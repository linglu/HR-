<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HR- Project

A React-based AI application powered by Gemini.

## 🚀 Features
- React + Vite + TypeScript
- Tailwind CSS v4
- Google Gemini AI Integration

## 🛠️ Local Development

### Prerequisites
- Node.js (v20 or higher recommended)
- npm

### Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Copy `.env.example` to `.env.local` and set your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env.local
   ```
3. **Run the app:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## 📦 Deployment

### GitHub Actions
This project is configured with GitHub Actions for automatic deployment to **GitHub Pages**.

1. Go to your GitHub repository settings.
2. Navigate to **Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Every push to the `main` branch will now trigger a build and deploy.

## 📄 Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run TypeScript type checking
- `npm run preview`: Preview production build locally
- `npm run clean`: Remove build artifacts

