# Academic Spark

A modern, real-time, AI-powered academic platform for students and educators.

---

## 🚀 Features

- **Real-Time Courses**: Browse and access courses from top providers worldwide.
- **My Learning**: Enroll in courses, track your progress, and manage your learning journey.
- **AI Q&A Assistant**: Get instant, intelligent answers to your academic questions using OpenAI.
- **Live Dashboard**: See your learning stats, AI usage, and real-time updates.
- **Secure Authentication**: Sign in with Google, GitHub, or email (via Supabase Auth).
- **Responsive UI**: Built with React, Vite, shadcn/ui, and Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Backend/DB**: Supabase (Postgres, Auth, Realtime)
- **AI**: OpenAI GPT-3.5/4 API
- **State/Data**: React Query

---

## ⚡ Getting Started

### 1. **Clone the Repository**
```bash
git clone https://github.com/your-username/academic-spark.git
cd academic-spark
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Environment Variables**
Copy `.env.example` to `.env` and fill in your Supabase and OpenAI keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 4. **Supabase Database Setup**
- Run the SQL in `database_setup.sql` in your Supabase SQL editor to create the required tables and policies.
- See `README_DATABASE.md` for details.

### 5. **Start the App**
```bash
npm run dev
```
- Open [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal).

---

## ✨ Usage
- **Browse Courses**: Go to "Courses" to explore and enroll in real-time courses.
- **My Learning**: View and manage your enrolled courses.
- **AI Q&A**: Ask academic questions and get instant AI-powered answers.
- **Dashboard**: See your stats and quick actions.

---

## 🧑‍💻 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
MIT

---

## 🙏 Acknowledgements
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)