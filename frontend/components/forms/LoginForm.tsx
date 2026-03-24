// c:\projects\kostian_task\frontend\components\forms\LoginForm.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import axios from 'axios';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setGlobalError('');
    setIsEmailNotVerified(false);

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || 'Login failed';
        if (msg === 'Email not verified') {
          setIsEmailNotVerified(true);
          setGlobalError('Please verify your email first');
        } else {
          setGlobalError(msg);
        }
      } else {
        setGlobalError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {globalError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-red-600 dark:text-red-400">{globalError}</p>
            {isEmailNotVerified && (
              <Link
                href={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
              >
                Go to verify email →
              </Link>
            )}
          </div>
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
        label="Password"
        type="password"
        placeholder="Your password"
        value={formData.password}
        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
        error={errors.password}
        autoComplete="current-password"
      />

      <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
        Sign in
      </Button>

      <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline font-medium">
          Register
        </Link>
      </p>
    </form>
  );
}
