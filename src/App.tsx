import { useMemo, useState } from 'react';
import { Newspaper, RefreshCw, Sparkles, Calendar, AlertCircle, CheckCircle2, Globe2 } from 'lucide-react';
import { TOPICS, type TopicKey, type Article } from '@/types';
import { useInterests, useArticles, useCollectNews, useHeadlines } from '@/hooks';
import InterestPicker from '@/components/InterestPicker';
import ArticleCard from '@/components/ArticleCard';
import HeadlineSlider from '@/components/HeadlineSlider';

export default function App() {
  const { selected, toggle, setMany, loaded } = useInterests();
  const topicKey = useMemo(() => selected.slice().sort(), [selected]);
  const { articles, loading, error, reload } = useArticles(topicKey);
  const { headlines, loadingHeadlines, reload: reloadHeadlines } = useHeadlines();
  const { collecting, collectResult, collectError, collect } = useCollectNews();
  const [showSettings, setShowSettings] = useState(false);

  const handleRefresh = async () => {
    await collect();
    reload();
    reloadHeadlines();
  };

  const indiaArticles = articles.filter((a) => a.region === 'india');
  const worldArticles = articles.filter((a) => a.region !== 'india');

  const renderGroup = (label: string, icon: React.ReactNode, list: Article[]) =>
    list.length > 0 && (
      <div className="mt-10">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-extrabold tracking-tight text-gray-900">
          {icon}
          {label}
          <span className="text-sm font-medium text-gray-400">{list.length}</span>
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    );

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const hasInterests = selected.length > 0;
  const showDigest = loaded && hasInterests;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold leading-none tracking-tight sm:text-lg">
                Daily Digest
              </h1>
              <p className="mt-0.5 text-xs text-gray-500">Your news, your topics</p>
            </div>
          </div>
          {showDigest && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={collecting}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${collecting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{collecting ? 'Updating…' : 'Update'}</span>
              </button>
              <button
                onClick={() => setShowSettings((s) => !s)}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                <Sparkles className="h-4 w-4" />
                Topics
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Onboarding / settings panel */}
        {(!showDigest || showSettings) && (
          <section className="mx-auto max-w-2xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Personalized for you
              </span>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {hasInterests ? 'Adjust your topics' : 'What are you interested in?'}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Pick the subjects you care about. We will gather the day's most
                important stories from each one and summarize them into quick reads.
              </p>
            </div>

            <div className="mt-8">
              <InterestPicker
                topics={TOPICS}
                selected={selected}
                onToggle={toggle}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setMany([])}
                disabled={selected.length === 0}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                onClick={() => {
                  setMany(TOPICS.map((t) => t.key));
                }}
                className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
              >
                Select all
              </button>
              <button
                disabled={selected.length === 0}
                onClick={() => setShowSettings(false)}
                className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {hasInterests ? 'Save & view digest' : 'Select at least one topic'}
              </button>
            </div>
          </section>
        )}

        {/* Digest view */}
        {showDigest && !showSettings && (
          <section>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {today}
                </div>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Your daily digest
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {articles.length > 0
                    ? `${articles.length} stor${articles.length === 1 ? 'y' : 'ies'} across ${selected.length} topic${selected.length === 1 ? '' : 's'}, India news first.`
                    : 'No stories found for your topics yet.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selected.map((k) => (
                  <span
                    key={k}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                  >
                    {TOPICS.find((t) => t.key === k)?.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Top-stories slideshow (5-10 slides) */}
            {!loadingHeadlines && headlines.length >= 5 && (
              <div className="mt-6">
                <HeadlineSlider headlines={headlines} />
              </div>
            )}

            {loading && (
              <div className="mt-12 flex flex-col items-center justify-center gap-3 text-gray-400">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <p className="text-sm">Gathering today's stories…</p>
              </div>
            )}

            {collectResult && !collecting && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {collectResult}
              </div>
            )}
            {collectError && !collecting && (
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {collectError}
              </div>
            )}
            {!loading && error && (
              <div className="mt-8 flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 ring-1 ring-rose-200">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {!loading && !error && articles.length > 0 && (
              <>
                {renderGroup(
                  'India News',
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold">IN</span>,
                  indiaArticles
                )}
                {renderGroup(
                  'World News',
                  <Globe2 className="h-5 w-5 text-gray-700" />,
                  worldArticles
                )}
              </>
            )}

            {!loading && !error && articles.length === 0 && (
              <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <Newspaper className="h-10 w-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-500">
                  No stories available for your selected topics right now.
                </p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="mt-2 text-sm font-semibold text-gray-900 underline underline-offset-2"
                >
                  Adjust your topics
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-gray-200 py-6">
        <p className="text-center text-xs text-gray-400">
          Daily Digest · Summaries generated from reliable news sources
        </p>
      </footer>
    </div>
  );
}
