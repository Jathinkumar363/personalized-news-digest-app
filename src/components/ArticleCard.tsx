import { ExternalLink, Clock } from 'lucide-react';
import type { Article } from '@/types';

const topicColors: Record<string, string> = {
  india: 'bg-orange-100 text-orange-700',
  world: 'bg-blue-100 text-blue-700',
  ai: 'bg-sky-100 text-sky-700',
  technology: 'bg-cyan-100 text-cyan-700',
  sports: 'bg-emerald-100 text-emerald-700',
  politics: 'bg-amber-100 text-amber-700',
  business: 'bg-rose-100 text-rose-700',
  science: 'bg-violet-100 text-violet-700',
};

const topicLabel: Record<string, string> = {
  india: 'India',
  world: 'World',
  ai: 'AI',
  technology: 'Technology',
  sports: 'Sports',
  politics: 'Politics',
  business: 'Business',
  science: 'Science',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h >= 1) return `${h}h ago`;
  const m = Math.floor(diff / 60000);
  if (m >= 1) return `${m}m ago`;
  return 'Just now';
}

export default function ArticleCard({ article }: { article: Article }) {
  const badge = topicColors[article.topic] ?? 'bg-gray-100 text-gray-700';
  const label = topicLabel[article.topic] ?? article.topic;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60">
      {article.image_url && (
        <div className="relative h-44 overflow-hidden sm:h-52">
          <img
            src={article.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}
          >
            {label}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-gray-900">
          {article.title}
        </h3>
        <ul className="mt-3 space-y-2">
          {article.summary.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-600">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{article.source_name}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeAgo(article.published_at)}
            </span>
          </div>
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 transition-colors hover:text-sky-600"
          >
            Read
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
