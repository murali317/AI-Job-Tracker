<div align="center">
  <h1>🚀 AI Job Tracker</h1>
  <p><strong>A full-stack, AI-powered job application tracker with resume analysis & job-match scoring</strong></p>

  <p>
    <a href="https://ai-job-tracker-wheat.vercel.app/">
      <img src="https://img.shields.io/badge/🔗_Live_App-Visit_Now-4f46e5?style=for-the-badge" alt="Live App" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/AI-Groq_Llama_3.1-FF6B35?logo=meta&logoColor=white" alt="Groq AI" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  </p>
</div>

---

## 📋 About

**AI Job Tracker** is a production-grade web application that helps job seekers organize their applications and leverage AI to optimize their job search. Instead of juggling spreadsheets, users can track every application, get instant AI-powered resume feedback, and check how well their resume matches any job description — all in one place.

**🔗 Live:** [ai-job-tracker-wheat.vercel.app](https://ai-job-tracker-wheat.vercel.app/)

---

## ✨ Features

### Core
- **Job Application CRUD** — Add, edit, delete, and filter applications by status (Applied, Interviewing, Offered, Rejected, Saved)
- **Status Tracking** — Visual status badges with color-coded cards and instant status updates
- **Secure Authentication** — JWT-based signup/login with bcrypt password hashing and persistent sessions

### AI-Powered
- **Resume Analyzer** — Upload or paste your resume to get an AI score (1–10), strengths, weaknesses, and actionable suggestions
- **Job Match Engine** — Compare your resume against any job description to get a match percentage, skill gap analysis, and tailored application tips
- **Multi-format Upload** — Client-side parsing of PDF, DOCX, and TXT files with zero backend overhead

### UX
- **Dark & Light Themes** — Polished UI in both modes with smooth transitions
- **Toast Notifications** — Success/info/error feedback for all actions
- **Responsive Design** — Optimized for desktop, tablet, and mobile
- **Password Strength Indicator** — Real-time visual feedback during signup
- **Logout Confirmation** — Modal prompt prevents accidental logouts
- **Drag & Drop** — File uploads support drag-and-drop on all devices

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite 8, React Router 7 |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | PostgreSQL (Neon serverless) |
| **AI** | Groq API (Llama 3.1 8B) |
| **File Parsing** | pdf.js, Mammoth.js (client-side) |
| **Auth** | JWT, bcrypt |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 📁 Project Structure

```
├── backend/
│   └── src/
│       ├── index.ts              # Express server & middleware
│       ├── config/
│       │   ├── db.ts             # PostgreSQL pool connection
│       │   └── schema.sql        # Database schema
│       ├── controllers/          # Request handlers
│       │   ├── authController.ts
│       │   ├── jobController.ts
│       │   └── aiController.ts
│       ├── services/             # Business logic & AI calls
│       │   ├── authService.ts
│       │   ├── jobService.ts
│       │   └── aiService.ts
│       ├── middleware/
│       │   └── auth.ts           # JWT verification middleware
│       └── routes/               # API route definitions
│           ├── auth.ts
│           ├── jobs.ts
│           └── ai.ts
│
├── frontend/
│   └── src/
│       ├── App.tsx               # Routes & auth guards
│       ├── api/index.ts          # Axios instance & API calls
│       ├── components/
│       │   ├── AddJobModal.tsx    # Create job form
│       │   ├── EditJobModal.tsx   # Edit job form
│       │   ├── JobCard.tsx        # Job application card
│       │   ├── JobMatchModal.tsx  # AI match (per-job)
│       │   ├── JobMatchTool.tsx   # AI match (standalone)
│       │   ├── ResumeAnalyzer.tsx # AI resume scoring
│       │   ├── ResumeUpload.tsx   # Reusable file upload
│       │   ├── ThemeToggle.tsx    # Dark/light switch
│       │   └── Toast.tsx         # Notification system
│       ├── context/
│       │   ├── AuthContext.tsx    # Auth state management
│       │   └── ThemeContext.tsx   # Theme state management
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   ├── SignupPage.tsx
│       │   └── DashboardPage.tsx
│       ├── types/index.ts        # TypeScript interfaces
│       └── utils/
│           └── fileExtract.ts    # PDF/DOCX/TXT parsing
│
└── vercel.json                   # SPA rewrite rules
```


---


## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p><strong>Built with ☕ and ❤️</strong></p>
  <p>If you found this useful, kindly give it a ⭐</p>
</div>
