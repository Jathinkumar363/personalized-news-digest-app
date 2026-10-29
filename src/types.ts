export type TopicKey =
  | 'india'
  | 'world'
  | 'ai'
  | 'technology'
  | 'sports'
  | 'politics'
  | 'business'
  | 'science';

export type Region = 'india' | 'international';

export interface Topic {
  key: TopicKey;
  label: string;
  description: string;
}

export const TOPICS: Topic[] = [
  {
    key: 'india',
    label: 'India',
    description: 'Top national news from Times of India, The Hindu, NDTV and more',
  },
  {
    key: 'world',
    label: 'World',
    description: 'Important international stories from BBC, Al Jazeera, Guardian',
  },
  {
    key: 'ai',
    label: 'AI',
    description: 'Artificial intelligence, machine learning, and models',
  },
  {
    key: 'technology',
    label: 'Technology',
    description: 'Gadgets, devices, and consumer tech',
  },
  {
    key: 'sports',
    label: 'Sports',
    description: 'Matches, results, and standout performances',
  },
  {
    key: 'politics',
    label: 'Politics',
    description: 'Legislation, government, and civic affairs',
  },
  {
    key: 'business',
    label: 'Business',
    description: 'Markets, mergers, and the economy',
  },
  {
    key: 'science',
    label: 'Science',
    description: 'Research, discovery, and breakthroughs',
  },
];

export interface Article {
  id: string;
  topic: TopicKey;
  title: string;
  summary: string[];
  source_name: string;
  source_url: string;
  image_url: string | null;
  published_at: string;
  region: Region;
}
