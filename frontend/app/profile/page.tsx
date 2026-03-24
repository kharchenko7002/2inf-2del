// c:\projects\kostian_task\frontend\app\profile\page.tsx

'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ThemeSwitcher from '../../components/ui/ThemeSwitcher';
import { useAuth } from '../../hooks/useAuth';
import { userApi } from '../../services/api';
import axios from 'axios';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep form in sync with user data on mount
  React.useEffect(() => {
    if (user) {
      setFormData((p) => ({ ...p, name: user.name, email: user.email }));
    }
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name || formData.name.length < 2)
      newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Valid email is required';
    if (formData.password && formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload: { name?: string; email?: string; password?: string } = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) payload.password = formData.password;

      const res = await userApi.updateProfile(payload);
      updateUser(res.data.data);
      setSuccessMsg('Profile updated successfully');
      setFormData((p) => ({ ...p, password: '', confirmPassword: '' }));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || 'Failed to update profile');
      } else {
        setErrorMsg('An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Profile Settings
          </h1>

          {/* Profile info */}
          <Card title="Account Information" className="mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                  {user?.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user?.email}
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {user?.role}
                </span>
              </div>
            </div>

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">{successMsg}</p>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                error={errors.email}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                error={errors.password}
              />
              {formData.password && (
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat your new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                  error={errors.confirmPassword}
                />
              )}
              <Button type="submit" isLoading={isLoading} className="mt-2">
                Save Changes
              </Button>
            </form>
          </Card>

          {/* Theme switcher */}
          <Card title="Appearance" subtitle="Choose your preferred theme">
            <ThemeSwitcher />
          </Card>

          {/* Account details */}
          <Card title="Account Details" className="mt-6">
            <div className="space-y-3">
              {[
                { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-' },
                { label: 'Last updated', value: user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : '-' },
                { label: 'Role', value: user?.role || '-' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b last:border-0" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item.label}
                  </span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
