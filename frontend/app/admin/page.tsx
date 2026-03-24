// c:\projects\kostian_task\frontend\app\admin\page.tsx

'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProtectedRoute from '../../components/layout/ProtectedRoute';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { adminApi, faqApi } from '../../services/api';
import { FAQ, User } from '../../types';

// --- FAQ Section ---

function FAQSection() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await faqApi.getAll();
      return res.data.data as FAQ[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { question: string; answer: string }) =>
      adminApi.createFaq(data.question, data.answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setShowForm(false);
      setFormData({ question: '', answer: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FAQ> }) =>
      adminApi.updateFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setEditItem(null);
      setFormData({ question: '', answer: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteFaq(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['faqs'] }),
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.question.trim()) errs.question = 'Question is required';
    if (!formData.answer.trim()) errs.answer = 'Answer is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditItem(faq);
    setFormData({ question: faq.question, answer: faq.answer });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditItem(null);
    setFormData({ question: '', answer: '' });
    setErrors({});
  };

  return (
    <Card
      title="FAQ Management"
      subtitle={`${faqs?.length || 0} entries`}
      actions={
        !showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            + Add FAQ
          </Button>
        )
      }
      className="mb-6"
    >
      {showForm && (
        <div className="mb-6 p-4 rounded-lg border space-y-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
          <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {editItem ? 'Edit FAQ' : 'New FAQ'}
          </h4>
          <Input
            label="Question"
            value={formData.question}
            onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
            error={errors.question}
          />
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Answer
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={{
                borderColor: errors.answer ? '#ef4444' : 'var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
              rows={4}
              value={formData.answer}
              onChange={(e) => setFormData((p) => ({ ...p, answer: e.target.value }))}
            />
            {errors.answer && <p className="mt-1 text-sm text-red-500">{errors.answer}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editItem ? 'Update' : 'Create'}
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {faqs?.map((faq) => (
            <div
              key={faq.id}
              className="flex items-start justify-between p-4 rounded-lg border"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}
            >
              <div className="flex-1 mr-4">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {faq.question}
                </p>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {faq.answer}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(faq)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm('Delete this FAQ?')) deleteMutation.mutate(faq.id);
                  }}
                  isLoading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {faqs?.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              No FAQs yet. Add one above.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// --- Users Section ---

function UsersSection() {
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editFields, setEditFields] = useState({ name: '', email: '' });

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await adminApi.getAllUsers();
      return res.data.data as User[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'user' | 'admin' }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditUser(null);
    },
  });

  const handleEdit = (user: User) => {
    setEditUser(user);
    setEditFields({ name: user.name, email: user.email });
  };

  const handleSave = () => {
    if (!editUser) return;
    updateMutation.mutate({ id: editUser.id, data: editFields });
  };

  return (
    <Card title="User Management" subtitle={`${users?.length || 0} users`}>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--bg-secondary)' }} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Name', 'Email', 'Role', 'Theme', 'Joined', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-2 font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <React.Fragment key={user.id}>
                  <tr
                    className="border-b"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <td className="py-3 px-2" style={{ color: 'var(--text-primary)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td className="py-3 px-2" style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </td>
                    <td className="py-3 px-2">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            id: user.id,
                            role: e.target.value as 'user' | 'admin',
                          })
                        }
                        className="text-xs px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{
                          borderColor: 'var(--border-color)',
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                      >
                        {user.theme}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (confirm(`Delete user ${user.name}?`))
                              deleteMutation.mutate(user.id);
                          }}
                        >
                          Del
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {editUser?.id === user.id && (
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <td colSpan={6} className="px-2 py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Input
                            value={editFields.name}
                            onChange={(e) => setEditFields((p) => ({ ...p, name: e.target.value }))}
                            placeholder="Name"
                            className="max-w-xs"
                          />
                          <Input
                            value={editFields.email}
                            onChange={(e) => setEditFields((p) => ({ ...p, email: e.target.value }))}
                            placeholder="Email"
                            className="max-w-xs"
                          />
                          <Button size="sm" onClick={handleSave} isLoading={updateMutation.isPending}>
                            Save
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditUser(null)}>
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Admin Panel
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Manage users and FAQ content
            </p>
          </div>

          <FAQSection />
          <UsersSection />
        </main>
      </div>
    </ProtectedRoute>
  );
}
