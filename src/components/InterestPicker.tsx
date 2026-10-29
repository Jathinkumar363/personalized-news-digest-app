import { Check } from 'lucide-react';
import type { Topic, TopicKey } from '@/types';

const topicAccent: Record<TopicKey, string> = {
  india: 'ring-orange-500 bg-orange-50',
  world: 'ring-blue-500 bg-blue-50',
  ai: 'ring-sky-500 bg-sky-50',
  technology: 'ring-cyan-500 bg-cyan-50',
  sports: 'ring-emerald-500 bg-emerald-50',
  politics: 'ring-amber-500 bg-amber-50',
  business: 'ring-rose-500 bg-rose-50',
  science: 'ring-violet-500 bg-violet-50',
};

export default function InterestPicker({
  topics,
  selected,
  onToggle,
}: {
  topics: Topic[];
  selected: TopicKey[];
  onToggle: (key: TopicKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {topics.map((topic) => {
        const active = selected.includes(topic.key);
        return (
          <button
            key={topic.key}
            type="button"
            onClick={() => onToggle(topic.key)}
            className={`relative flex flex-col items-start gap-1 rounded-xl p-4 text-left ring-2 transition-all duration-200 ${
              active
                ? `${topicAccent[topic.key]} shadow-sm`
                : 'ring-gray-200 bg-white hover:ring-gray-300'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
              {topic.label}
              {active && <Check className="h-4 w-4 text-gray-900" />}
            </span>
            <span className="text-xs leading-snug text-gray-500">
              {topic.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
