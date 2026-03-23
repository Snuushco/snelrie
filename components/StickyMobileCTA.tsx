'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function StickyMobileCTA({
  href = '/scan',
  label = 'Start Gratis Scan',
}: {
  href?: string;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Show after scrolling 400px (past hero CTA)
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-bottom">
        <Link
          href={href}
          className="flex items-center justify-center gap-2 w-full bg-brand-600 text-white py-3.5 rounded-xl text-base font-semibold hover:bg-brand-700 active:bg-brand-800 transition shadow-lg shadow-brand-600/25"
        >
          {label}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
