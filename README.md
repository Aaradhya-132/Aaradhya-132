# 🌍 explorer.ai — Smart Group Travel Planning & Itinerary Generator

<div align="center">

![explorer.ai](https://img.shields.io/badge/explorer.ai-Smart-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![AI Powered](https://img.shields.io/badge/AI-Powered-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

### ✈️ Plan Smarter. Explore Better. Travel Together.

**An AI-powered platform that simplifies group travel planning, creating personalized itineraries and resolving group conflicts intelligently.**

</div>

---

## 🌟 Overview

Planning a group trip can be stressful—balancing budgets, preferences, and schedules. **explorer.ai** modernizes this process by acting as an intelligent travel coordinator. It leverages AI to build cohesive plans that cater to everyone's needs.

## ✨ Key Features

* 🤖 **AI Itinerary Generator:** Generate detailed, day-wise travel plans based on group interests.
* 🧠 **Smart Conflict Resolution:** AI-driven logic to balance conflicting group preferences.
* 💰 **Budget Optimizer:** Estimates costs and suggests travel optimizations.
* 👥 **Real-time Collaboration:** A centralized hub for group members to vote and discuss.
* 💬 **Travel Assistant:** An AI-powered chatbot for instant travel tips and support.
* 🛡️ **Admin Controls:** Comprehensive dashboard for trip validation and management.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **AI/LLM:** Google Gemini AI / OpenAI
- **Real-time:** Socket.io
- **Authentication:** JWT & Bcrypt

## 📁 Folder Structure

```text
explorer.ai/
├── client/          # Vite + React Frontend
├── server/          # Node.js + Express Backend
├── .github/         # CI/CD Workflows
└── README.md        # Core Documentation
```

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* MongoDB (v6+)
* API Keys (Google Gemini or OpenAI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AaradhyaTodkar/explorer.ai.git
   cd explorer.ai
   ```

2. **Install dependencies:**
   ```bash
   npm run install-all
   ```

3. **Environment Setup:**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_api_key
   JWT_SECRET=your_secret_key
   ```

### Running the Project

- **Development Mode:**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

- **Build for Production:**
   ```bash
   npm run build
   ```

---

## 👨‍💻 Author

**Aaradhya Todkar**
- GitHub: [@AaradhyaTodkar](https://github.com/AaradhyaTodkar)

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
⭐ **If you like this project, give it a star!**
