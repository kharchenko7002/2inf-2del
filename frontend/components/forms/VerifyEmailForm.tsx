'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import axios from 'axios';

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get('email');

  const [formData, setFormData] = useState({
    email: emailFromParams || '',
    code: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendCountdown, canResend]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.code) newErrors.code = 'Verification code is required';
    else if (!/^\d{6}$/.test(formData.code)) newErrors.code = 'Code must be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setGlobalError('');
    setGlobalSuccess('');

    try {
      await authApi.verifyEmail(formData.email, formData.code);
      setGlobalSuccess('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || 'Verification failed';
        setGlobalError(msg);
      } else {
        setGlobalError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      setResendError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setResendError('Please enter a valid email address');
      return;
    }

    setResendLoading(true);
    setResendError('');
    setResendSuccess('');

    try {
      await authApi.resendVerificationCode(formData.email);
      setResendSuccess('Verification code sent! Check your email.');
      setCanResend(false);
      setResendCountdown(60);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || 'Failed to resend code';
        setResendError(msg);
      } else {
        setResendError('An unexpected error occurred');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {globalError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{globalError}</p>
        </div>
      )}

      {globalSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">{globalSuccess}</p>
        </div>
      )}

      {resendSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">{resendSuccess}</p>
        </div>
      )}

      {resendError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{resendError}</p>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        label="Verification Code"
        type="text"
        placeholder="000000"
        value={formData.code}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
          setFormData((p) => ({ ...p, code: value }));
        }}
        error={errors.code}
        maxLength={6}
      />

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Please enter the 6-digit code sent to your email. The code expires in 10 minutes.
      </p>

      <div className="flex gap-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Verify Email
        </Button>
        <Button
          type="button"
          onClick={handleResend}
          isLoading={resendLoading}
          disabled={!canResend || resendLoading}
          className="flex-1"
        >
          {canResend ? 'Resend Code' : `Resend in ${resendCountdown}s`}
        </Button>
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Go to{' '}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          login
        </Link>
      </p>
    </form>
  );
}
