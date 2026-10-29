import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Article, TopicKey } from '@/types';

const STORAGE_KEY = 'news_digest_topics';

export function useInterests() {
  const [selected, setSelected] = useState<TopicKey[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSelected(JSON.parse(stored));
      } catch {
        setSelected([]);
      }
    }
    setLoaded(true);
  }, []);

  const toggle = useCallback((key: TopicKey) => {
    setSelected((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setMany = useCallback((keys: TopicKey[]) => {
    setSelected(keys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  }, []);

  return { selected, toggle, setMany, loaded };
}

export function useArticles(topics: TopicKey[]) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const topicKey = useMemo(() => topics.slice().sort(), [topics]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (topicKey.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select(
          'id, topic, title, summary, source_name, source_url, image_url, published_at, region'
        )
        .in('topic', topicKey.length > 0 ? topicKey : ['__none__'])
        .order('published_at', { ascending: false });
      if (!active) return;
      if (error) {
        setError('We could not load your news digest. Please try again shortly.');
        setArticles([]);
      } else {
        setError(null);
        setArticles((data ?? []) as Article[]);
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [topicKey.join(','), reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { articles, loading, error, reload };
}

export function useCollectNews() {
  const [collecting, setCollecting] = useState(false);
  const [collectResult, setCollectResult] = useState<string | null>(null);
  const [collectError, setCollectError] = useState<string | null>(null);

  const collect = useCallback(async () => {
    setCollecting(true);
    setCollectError(null);
    setCollectResult(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/collect-news`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new Error(`Collection failed (${res.status})`);
      }
      const data = await res.json();
      if (data.ok) {
        const inserted = data.inserted ?? 0;
        const deduped = data.deduped ?? 0;
        setCollectResult(
          inserted > 0
            ? `${inserted} new stor${inserted === 1 ? 'y' : 'ies'} added${deduped > 0 ? `, ${deduped} already up to date` : ''}.`
            : `No new stories — everything is already up to date.`
        );
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setCollectError(
        err instanceof Error ? err.message : 'Could not reach the news service.'
      );
    } finally {
      setCollecting(false);
    }
  }, []);

  return { collecting, collectResult, collectError, collect };
}

export function useHeadlines() {
  const [headlines, setHeadlines] = useState<Article[]>([]);
  const [loadingHeadlines, setLoadingHeadlines] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoadingHeadlines(true);
      const { data } = await supabase
        .from('articles')
        .select('id, topic, title, summary, source_name, source_url, image_url, published_at, region')
        .order('published_at', { ascending: false })
        .limit(30);
      if (!active) return;
      const rows = (data ?? []) as Article[];
      rows.sort((a, b) => {
        if (a.region === 'india' && b.region !== 'india') return -1;
        if (a.region !== 'india' && b.region === 'india') return 1;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
      setHeadlines(rows);
      setLoadingHeadlines(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { headlines, loadingHeadlines, reload };
}
