// src/pages/Help.jsx

export default function Help() {
  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      {/* Header */}
      <header className="text-center mb-12">
        <img
          src="train.png"
          alt="Kochi Metro"
          className="mx-auto mb-4 w-80 h-80 object-contain"
        />
        <h1 className="text-4xl font-heading text-primary mb-2">
          KMRLSIH — Smart Engine of Directives
        </h1>
        <p className="text-neutral-600">
          Automated, prioritized, bilingual directive delivery to combat document overload.
        </p>
      </header>

      {/* Table of Contents */}
      <nav className="bg-neutral-100 p-4 rounded-lg shadow-sm mb-12">
        <h2 className="font-heading text-lg mb-3">📋 Table of Contents</h2>
        <ul className="grid grid-cols-2 gap-2 text-sm">
          <li><a href="#introduction" className="text-accent hover:underline">Introduction</a></li>
          <li><a href="#tech-stack" className="text-accent hover:underline">Tech Stack</a></li>
          <li><a href="#features" className="text-accent hover:underline">Features</a></li>
          <li><a href="#quick-start" className="text-accent hover:underline">Quick Start</a></li>
          <li><a href="#env-vars" className="text-accent hover:underline">Environment Variables</a></li>
          <li><a href="#docker" className="text-accent hover:underline">Docker & NLTK/Tesseract</a></li>
          <li><a href="#api" className="text-accent hover:underline">API Examples</a></li>
          <li><a href="#structure" className="text-accent hover:underline">Project Structure</a></li>
          <li><a href="#notes" className="text-accent hover:underline">Notes & Recommendations</a></li>
        </ul>
      </nav>

      {/* Sections */}
      <div className="space-y-12 text-neutral-700">

        {/* Introduction */}
        <section id="introduction">
          <h2 className="text-2xl font-heading text-primary mb-4">🤖 Introduction</h2>
          <p>KMRLSIH converts fragmented and multilingual documents into <strong>searchable, prioritized directives</strong>.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>➜ <b>Ingest</b> → WhatsApp, Email, Maximo, SharePoint, manual uploads.</li>
            <li>➜ <b>Process</b> → Five-stage AI pipeline: OCR → NLP → Semantic chunking → Entity extraction & summarization → Indexing.</li>
            <li>➜ <b>Classify</b> → Priority detection (urgent / medium / low) and trigger notifications.</li>
            <li>➜ <b>Deliver</b> → Role-based dashboards (English & Malayalam) with full audit logs.</li>
          </ul>
        </section>

        {/* Tech Stack */}
        <section id="tech-stack">
          <h2 className="text-2xl font-heading text-primary mb-4">⚙️ Tech Stack</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><b>Frontend:</b> React (Vite)</li>
            <li><b>Backend:</b> FastAPI (Python)</li>
            <li><b>AI/ML:</b> OCR, NLP, Transformer models, FAISS vector store</li>
            <li><b>Database:</b> PostgreSQL, FAISS</li>
            <li><b>Cache:</b> Redis</li>
            <li><b>Notifications:</b> EmailJS (extensible)</li>
            <li><b>Deployment:</b> Docker / Docker Compose</li>
          </ul>
        </section>

        {/* Features */}
        <section id="features">
          <h2 className="text-2xl font-heading text-primary mb-4">🔋 Features</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Unified Upload Hub — aggregate documents from multiple sources.</li>
            <li>Five-stage AI pipeline — OCR, normalisation, chunking, extraction, indexing.</li>
            <li>Priority classification — auto-detect urgent directives and notify stakeholders.</li>
            <li>Bilingual UI — English & Malayalam.</li>
            <li>Fast vector search with FAISS + Redis caching.</li>
            <li>Role-based dashboards with permissions.</li>
            <li>Audit logging — full traceability.</li>
          </ul>
        </section>

        {/* Quick Start */}
        <section id="quick-start">
          <h2 className="text-2xl font-heading text-primary mb-4">🤸 Quick Start</h2>
          <div className="space-y-4">
            <div>
              <p><b>1) Clone</b></p>
              <pre className="bg-neutral-100 p-3 rounded-md overflow-x-auto text-sm">
                git clone https://github.com/BhishanSharma/KMRLSIH{"\n"}
                cd KMRLSIH
              </pre>
            </div>
            <div>
              <p><b>2) Frontend</b></p>
              <pre className="bg-neutral-100 p-3 rounded-md overflow-x-auto text-sm">
                cd frontend{"\n"}
                npm install{"\n"}
                npm run dev
              </pre>
            </div>
            <div>
              <p><b>3) Backend</b></p>
              <pre className="bg-neutral-100 p-3 rounded-md overflow-x-auto text-sm">
                cd backend{"\n"}
                python -m venv venv{"\n"}
                source venv/bin/activate{"\n"}
                pip install -r requirements.txt{"\n"}
                uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
              </pre>
            </div>
          </div>
        </section>

        {/* Environment Variables */}
        <section id="env-vars">
          <h2 className="text-2xl font-heading text-primary mb-4">🧾 Environment Variables</h2>
          <pre className="bg-neutral-100 p-3 rounded-md overflow-x-auto text-sm">
{`SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://kmrl_user:kmrl_pass@postgres:5432/kmrl_db
REACT_APP_EMAILJS_USERID=your_emailjs_user_id
REACT_APP_EMAILJS_TEMPLATEID=your_emailjs_template_id
REACT_APP_EMAILJS_RECEIVERID=your_emailjs_receiver_id
SECRET_KEY=changeme
REDIS_URL=redis://redis:6379/0`}
          </pre>
          <p className="text-warning mt-2">⚠️ Never commit your .env file. Use a secrets manager in production.</p>
        </section>

        {/* Docker */}
        <section id="docker">
          <h2 className="text-2xl font-heading text-primary mb-4">🐳 Docker & NLTK / Tesseract Setup</h2>
          <p>Backend Dockerfile example:</p>
          <pre className="bg-neutral-100 p-3 rounded-md overflow-x-auto text-sm">
{`FROM python:3.11-slim
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-eng tesseract-ocr-mal
...`}
          </pre>
          <p className="mt-2">You can also use <code>docker-compose</code> for full setup with Postgres & Redis.</p>
        </section>

        {/* API Examples */}
        <section id="api">
          <h2 className="text-2xl font-heading text-primary mb-4">🔁 API Examples — /history</h2>
          <pre className="bg-neutral-100 p-3 rounded-md overflow-x-auto text-sm">
{`POST /profile/history
GET  /profile/history?user_id=<id>`}
          </pre>
          <p className="mt-2">Includes Supabase integration for storing and fetching document history.</p>
        </section>

        {/* Project Structure */}
        <section id="structure">
          <h2 className="text-2xl font-heading text-primary mb-4">📂 Project Structure</h2>
          <pre className="bg-neutral-100 p-3 rounded-md overflow-x-auto text-sm">
{`KMRLSIH/
├─ frontend/
├─ backend/
├─ database/
├─ docker-compose.yml
└─ README.md`}
          </pre>
        </section>

        {/* Notes */}
        <section id="notes">
          <h2 className="text-2xl font-heading text-primary mb-4">✅ Notes & Recommendations</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Never store plaintext passwords — always hash with bcrypt or similar.</li>
            <li>Keep Supabase keys server-side with RLS enabled.</li>
            <li>Ensure Tesseract has Malayalam traineddata for OCR quality.</li>
            <li>Use TLS, CORS, rate-limiting, and CI/CD pipelines in production.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
