
# United Global Services - Travel & Visa Website

This repository contains the source code for the United Global Services (UGS) official website. This web application provides a comprehensive platform for clients seeking travel and visa services, and for administrators to manage services and client requests.

-----

## 🚀 About The Project

United Global Services (UGS) aims to simplify the visa application and travel process for its clients. This website is the primary interface for clients to learn about visa requirements, request various travel-related services, and track their application status. It also includes a robust dashboard for UGS administrators to manage the entire workflow efficiently.

-----

## ✨ Features

- **Visa Education Hub:** Learn visa requirements by country with a clean, readable knowledge base (`VisaEdPage`).
- **Client Dashboard:** Manage profile, upload documents, submit requests, and track application status.
- **Realtime Messaging (New):** Secure, low-latency, two-way chat between clients and UGS support.
- **Admin Dashboard:** Operate with confidence—review applications, reply to clients, and monitor activity.
- **AI Assistant:** Built-in concierge (`AllenAI`) for instant answers and guidance.
- **Responsive Design:** Crafted for desktop and mobile with premium visuals and smooth UX.

-----

## 🛠️ Tech Stack

This project is built with modern web technologies:

- **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)  
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components  
- **Build Tool:** [Vite](https://vitejs.dev/)  
- **Routing:** [React Router](https://reactrouter.com/)  

-----

## 💬 Realtime Messaging (Premium Experience)

UGS now offers a refined, secure chat channel between clients and support.

- **Storage model:** top-level Firestore collection `messages`
- **Schema:**
  - `userId: string` – UID of the client the thread belongs to
  - `text: string`
  - `byUid: string` – sender UID
  - `byRole: 'user' | 'admin'`
  - `createdAt: Firebase ServerTimestamp`
- **UI alignment:**
  - Client view: user messages (you) on the right; admin on the left
  - Admin view: admin messages (you) on the right; user on the left
- **Timestamps:** Displayed per message using the server timestamp
- **Realtime:** No composite index required for subscriptions

Key implementation files:
- `src/lib/db.ts` → `subscribeDirectMessages()` filters by `userId` and sorts client‑side by `createdAt`.
- `src/components/ClientDashboard.tsx` → client chat send/subscribe; robust sending state + error toasts.
- `src/components/AdminDashboard.tsx` → admin chat with correct left/right alignment and timestamps.

### Firestore Security Rules

Add a rule block for top-level `messages` in your Firestore rules:

```rules
match /databases/{database}/documents {
  match /messages/{docId} {
    allow read, list: if request.auth != null && (
      resource.data.userId == request.auth.uid || request.auth.token.admin == true
    );
    allow create: if request.auth != null && (
      // client can create their own messages
      (request.resource.data.userId == request.auth.uid && request.resource.data.byRole == 'user') ||
      // admins can create for any thread
      request.auth.token.admin == true
    );
    allow update, delete: if request.auth.token.admin == true; // tighten as needed
  }
}
```

This aligns with how the app writes/reads and keeps your chat ultra-responsive.

-----

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation

1. Clone the repo

   git clone https://github.com/israelseleshi/UGS-website.git

2. Navigate to the project directory

   ```sh
   cd UGS-website
   ```
3. Install NPM packages

   ```sh
   npm install
   ```
4. Run the development server

   ```sh
   npm run dev
   ```

   The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Environment

Create a `.env` file at the project root following `.env.example`. Provide your Firebase config and any optional keys used by features (e.g., Cloudinary). Restart the dev server after changes.

---

## 📂 Folder Structure

The project follows a standard React application structure:

```bash
/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons, etc.
│   ├── components/      # Reusable React components
│   ├── App.tsx          # Main application component with routing
│   ├── main.tsx         # Entry point of the application
│   └── index.css        # Global styles
├── package.json
└── README.md
```

---

## 🧭 Usage Guide

- **Client Messaging:** Navigate to `Dashboard → Messages` to chat with support. Your messages send with a polished pending state and clear error handling.
- **Admin Messaging:** Go to `Admin → Messages`, choose a conversation on the left, and reply on the right panel. Your own messages appear on the right with timestamps.

---

## 🧩 Troubleshooting

- If messages write but do not display, ensure the `messages` rule block is deployed and you’re authenticated.
- No Firestore index is required for messaging; we sort client‑side after a simple equality filter.
- Hard refresh after deploying rules or switching users.

---

## 📝 License

This project is proprietary to United Global Services. All rights reserved.
