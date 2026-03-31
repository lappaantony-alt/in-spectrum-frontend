import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';
import { updateMe } from '../api/auth';
import type { UserResponse } from '../api/types';
import axios from 'axios';
import { nameSchema, phoneSchema } from '../lib/validations';

const profileSchema = z.object({
  name: nameSchema,
  phoneNumber: phoneSchema,
});

type ProfileFormData = z.infer<typeof profileSchema>;

const userTypeLabels: Record<string, string> = {
  PARENT: 'Батько / Мати',
  EDUCATOR: 'Педагог',
};

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => updateMe(data),
    onSuccess: (updatedUser: UserResponse) => {
      toast.success('Дані оновлено!');
      refreshUser(updatedUser);
      reset({
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const msg =
          (error.response?.data as { message?: string })?.message ||
          'Не вдалося оновити дані.';
        toast.error(msg);
      } else {
        toast.error('Сталася непередбачена помилка.');
      }
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Профіль</h1>
        <p className="mt-1 text-text-secondary">
          Перегляньте та оновіть ваші особисті дані.
        </p>
      </div>

      {/* User Info Card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
            <span className="text-2xl font-bold text-primary-dark">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {user.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-sm text-text-secondary">{user.email}</span>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center rounded-lg bg-secondary-light px-2 py-0.5 text-xs font-semibold text-secondary-dark">
                {userTypeLabels[user.userType] || user.userType}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card">
        <h2 className="mb-5 text-lg font-semibold text-text-primary">
          Редагування
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="profile-name" className="label">
              Повне ім'я
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              placeholder="Ваше ім'я"
              className={`input ${errors.name ? 'input-error' : ''}`}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email (readonly) */}
          <div>
            <label htmlFor="profile-email" className="label">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              readOnly
              className="input cursor-not-allowed bg-gray-50 text-text-secondary"
            />
            <p className="mt-1 text-xs text-text-secondary">
              Email не можна змінити.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="profile-phone" className="label">
              Номер телефону
            </label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+380 XX XXX XXXX"
              className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
              {...register('phoneNumber')}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
            <button
              id="profile-submit"
              type="submit"
              disabled={mutation.isPending || !isDirty}
              className="btn-primary"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Збереження…
                </span>
              ) : (
                'Зберегти зміни'
              )}
            </button>
            {!isDirty && (
              <span className="text-xs text-text-secondary">
                Немає змін для збереження.
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">
          Інформація про акаунт
        </h2>
        <div className="space-y-2 text-sm text-text-secondary">
          <p>
            <span className="font-medium text-text-primary">Роль:</span>{' '}
            {userTypeLabels[user.userType] || user.userType}
          </p>
          <p>
            <span className="font-medium text-text-primary">Зареєстровано:</span>{' '}
            {new Date(user.createdAt).toLocaleDateString('uk-UA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
