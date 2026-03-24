'use client';

import React from 'react';
import Card from '../../components/ui/Card';
import VerifyEmailForm from '../../components/forms/VerifyEmailForm';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Email</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter the 6-digit code sent to your email address
            </p>
          </div>
          <VerifyEmailForm />
        </Card>
      </div>
    </div>
  );
}
