# EnTiKayShop Management

A modern web application for managing product inventory, expiry dates, and customer information. Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Firebase Firestore**.

## ✨ Features

- **Product CRUD** – Add, edit, delete products with optimistic UI updates.
- **Product type management** – Inline editing of product categories, cached for 60 seconds.
- **Expiry tracking** – Visual status badges (safe, warning, expired) and remaining days counter.
- **Advanced filtering** – Search by name, customer, description, source; filter by status and product type; optional "expiring soon" toggle.
- **Detailed product dialog** – Shows all fields (name, type, description, source, customer info, sold/expiry dates, remaining days, notes, batch number) with colorful sections.
- **Responsive design** – Works on desktop and mobile, with loading skeletons for better UX.
- **Beautiful UI** – Gradient buttons, hover effects, custom dialogs, and consistent styling.

## 📦 Tech Stack

- **React** with hooks & context API
- **TypeScript**
- **Vite** – Fast dev server & bundler
- **Tailwind CSS** – Utility‑first styling
- **Firebase Firestore** – Cloud database
- **lucide‑react** – Icon set

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18)
- npm or pnpm
- A Firebase project with Firestore enabled

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd "Quản Lý"

# Install dependencies
npm install   # or pnpm install
```

### Environment variables

Create a `.env` file in the project root (it is already ignored by `.gitignore`):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
npm run build
npm run preview   # preview the built app locally
```

## 📂 Project Structure

```
src/
├─ components/               # Reusable UI components (Button, Dialog, etc.)
│   ├─ ui/                   # Tailwind UI primitives
│   ├─ ProductForm.tsx       # Form for adding/editing a product
│   └─ ProductDetailDialog.tsx  # Detailed product view dialog
├─ contexts/                 # React Contexts (Products, ProductTypes) with caching & optimistic updates
├─ pages/                    # Page components (Dashboard, Products, ProductTypes)
├─ services/                 # Firebase CRUD functions (db.ts)
├─ lib/                      # Utility helpers (export, utils)
├─ index.css                 # Global Tailwind imports
└─ App.tsx                   # Root component with routing and providers
```

## 🛠️ Scripts

- `npm run dev` – Start the development server.
- `npm run build` – Build the production bundle.
- `npm run preview` – Preview the production build locally.

## 📦 Deployment

The app can be deployed to any static‑hosting platform (Vercel, Netlify, Firebase Hosting, etc.). Example for Firebase Hosting:

```bash
npm run build
firebase login
firebase init hosting   # select the "dist" folder
firebase deploy
```

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes and push to your fork.
4. Open a Pull Request.

Please run `npm run lint` and ensure the code follows existing linting rules before submitting.

## 📄 License

This project is licensed under the MIT License.

---

*Enjoy managing your inventory with **EnTiKayShop Management**!*
