/*
# Add region column to articles table

1. Modified Tables
- `articles`
  - Adds `region` (text, not null, default 'international') — tags each story as
    'india' or 'international' so the frontend can prioritize India news first
    and group the rest as world news.
2. Index
- Adds `articles_region_idx` for filtering by region.
3. Security
- No policy changes. The table remains open to anon + authenticated (shared data).
*/

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS region text NOT NULL DEFAULT 'international';

CREATE INDEX IF NOT EXISTS articles_region_idx ON articles (region);
