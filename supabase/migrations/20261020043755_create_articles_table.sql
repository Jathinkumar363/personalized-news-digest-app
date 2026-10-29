/*
# Create articles table for daily news digest (single-tenant, no auth)

1. New Tables
- `articles`
  - `id` (uuid, primary key)
  - `topic` (text, not null) — category key such as 'ai', 'technology', 'sports', 'politics', 'business', 'science'
  - `title` (text, not null) — headline of the story
  - `summary` (jsonb, not null) — array of short bullet-point strings, the AI-style summary
  - `source_name` (text, not null) — name of the originating news outlet
  - `source_url` (text, not null) — link to the original article
  - `image_url` (text) — optional hero image URL
  - `published_at` (timestamptz, not null) — when the story was published
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `articles`.
- Single-tenant app with no sign-in: allow anon + authenticated full CRUD because the
  data is intentionally shared/public across all readers.
3. Indexes
- Index on `topic` for filtering by interest.
- Index on `published_at` descending for "latest first" ordering.
*/

CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  title text NOT NULL,
  summary jsonb NOT NULL,
  source_name text NOT NULL,
  source_url text NOT NULL,
  image_url text,
  published_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS articles_topic_idx ON articles (topic);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles (published_at DESC);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_articles" ON articles;
CREATE POLICY "anon_select_articles" ON articles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_articles" ON articles;
CREATE POLICY "anon_insert_articles" ON articles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_articles" ON articles;
CREATE POLICY "anon_update_articles" ON articles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_articles" ON articles;
CREATE POLICY "anon_delete_articles" ON articles FOR DELETE
  TO anon, authenticated USING (true);
