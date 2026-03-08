'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Package } from 'lucide-react';

interface ProductCardProps {
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  affiliateUrl: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  sleep: 'bg-indigo-50 text-indigo-600',
  exercise: 'bg-orange-50 text-orange-600',
  nutrition: 'bg-green-50 text-green-600',
  stress: 'bg-purple-50 text-purple-600',
  productivity: 'bg-blue-50 text-blue-600',
  hydration: 'bg-cyan-50 text-cyan-600',
};

export default function ProductCard({ name, description, imageUrl, price, affiliateUrl, category }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-2xl border border-ofira-card-border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_20px_rgba(13,148,136,0.08)]"
    >
      {/* Image */}
      <div className="flex h-48 items-center justify-center bg-ofira-surface1">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <Package className="size-12 text-ofira-text-secondary/30" />
        )}
      </div>

      <div className="p-5">
        <span className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[category] || 'bg-gray-50 text-gray-600'}`}>
          {category}
        </span>
        <h3 className="mb-1 font-semibold text-ofira-text">{name}</h3>
        {description && <p className="mb-3 text-sm text-ofira-text-secondary line-clamp-2">{description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-ofira-text">${price}</span>
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-ofira-violet px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ofira-violet/90"
          >
            Ver <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
