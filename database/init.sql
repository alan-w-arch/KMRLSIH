-- init.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT UNIQUE,
  role TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  doc_key TEXT UNIQUE NOT NULL,
  original_filename TEXT,
  file_size BIGINT,
  mime_type TEXT,
  file_hash TEXT,
  storage_uri TEXT,
  source_system TEXT,
  source_reference TEXT,
  department_id INT REFERENCES departments(id),
  language_code TEXT,
  is_scanned BOOLEAN DEFAULT FALSE,
  upload_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed BOOLEAN DEFAULT FALSE,
  version INT DEFAULT 1,
  parent_document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
  raw_text TEXT,
  clean_text TEXT,
  raw_text_tsv tsvector,
  doc_summary TEXT,
  num_sentences INT,
  num_words INT,
  primary_author TEXT,
  tags JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE OR REPLACE FUNCTION trg_update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE PROCEDURE trg_update_updated_at();

CREATE TABLE chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  chunk_key TEXT,
  chunk_text TEXT,
  chunk_text_tsv tsvector,
  num_sentences INT,
  num_tokens INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT uniq_doc_chunk UNIQUE(document_id, chunk_index)
);

CREATE TABLE entities (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  chunk_id BIGINT REFERENCES chunks(id) ON DELETE CASCADE,
  entity_text TEXT NOT NULL,
  normalized_text TEXT,
  label TEXT,
  confidence REAL,
  start_offset INT,
  end_offset INT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE summaries (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  chunk_id BIGINT REFERENCES chunks(id) ON DELETE CASCADE,
  summary_type TEXT,
  persona TEXT,
  content TEXT,
  model_name TEXT,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE classifications (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  confidence REAL,
  model_name TEXT,
  model_version TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE embeddings (
  id BIGSERIAL PRIMARY KEY,
  chunk_id BIGINT REFERENCES chunks(id) ON DELETE CASCADE,
  vector vector(768),
  model_name TEXT,
  model_version TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE pipeline_runs (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  run_uuid UUID DEFAULT gen_random_uuid(),
  initiated_by BIGINT REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE pipeline_logs (
  id BIGSERIAL PRIMARY KEY,
  pipeline_run_id BIGINT REFERENCES pipeline_runs(id) ON DELETE CASCADE,
  stage TEXT,
  message TEXT,
  model_name TEXT,
  model_version TEXT,
  level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE feedback (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  chunk_id BIGINT REFERENCES chunks(id),
  user_id BIGINT REFERENCES users(id),
  feedback_type TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE document_links (
  id BIGSERIAL PRIMARY KEY,
  from_document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  to_document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  relation_type TEXT,
  evidence JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT uniq_link UNIQUE(from_document_id, to_document_id, relation_type)
);

CREATE TABLE access_events (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  document_id BIGINT REFERENCES documents(id),
  chunk_id BIGINT REFERENCES chunks(id),
  action TEXT,
  remote_addr TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE document_tags (
  document_id BIGINT REFERENCES documents(id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY(document_id, tag_id)
);

CREATE INDEX idx_documents_doc_key ON documents(doc_key);
CREATE INDEX idx_documents_department ON documents(department_id);
CREATE INDEX idx_documents_tsv ON documents USING GIN (raw_text_tsv);
CREATE INDEX idx_chunks_tsv ON chunks USING GIN (chunk_text_tsv);
CREATE INDEX idx_entities_label ON entities(label);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_pipeline_runs_document ON pipeline_runs(document_id);
