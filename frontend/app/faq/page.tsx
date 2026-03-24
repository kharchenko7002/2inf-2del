// c:\projects\kostian_task\frontend\app\faq\page.tsx

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import { faqApi } from '../../services/api';
import { FAQ } from '../../types';

function FAQItem({ faq }: { faq: FAQ }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border rounded-xl overflow-hidden transition-all duration-200"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-opacity-50 transition-colors"
        style={{ backgroundColor: isOpen ? 'var(--bg-secondary)' : 'var(--bg-card)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-sm pr-4" style={{ color: 'var(--text-primary)' }}>
          {faq.question}
        </span>
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="px-5 pb-5 pt-2 border-t"
          style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)' }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {faq.answer}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await faqApi.getAll();
      return res.data.data as FAQ[];
    },
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Everything you need to know about TempMonitor
            </p>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600">Failed to load FAQs</p>
            </div>
          )}

          {faqs && faqs.length > 0 && (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.id} faq={faq} />
              ))}
            </div>
          )}

          {faqs && faqs.length === 0 && (
            <div
              className="text-center py-16"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="w-12 h-12 opacity-30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No FAQs available yet</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
