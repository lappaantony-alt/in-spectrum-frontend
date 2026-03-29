import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../auth/useAuth';
import axios from 'axios';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(2, "Ім'я повинно містити щонайменше 2 символи"),
  phoneNumber: z.string().min(7, 'Будь ласка, введіть коректний номер телефону'),
  email: z.string().email('Будь ласка, введіть коректний email'),
  password: z.string().min(6, 'Пароль повинен містити щонайменше 6 символів'),
  userType: z.enum(['PARENT', 'EDUCATOR'], {
    error: 'Будь ласка, оберіть роль',
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const message = (error.response.data as { message?: string })?.message;
        toast.error(message || 'Перевірте ваші дані та спробуйте ще раз.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Створіть акаунт
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Приєднуйтеся до InSpectrum для персоналізованих навчальних планів
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="label">
                Повне імʼя
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                className={`input ${errors.name ? 'input-error' : ''}`}
                {...register('name')}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phoneNumber" className="label">
                Номер телефону
              </label>
              <input
                id="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="+1 234 567 8901"
                className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Щонайменше 6 символів"
                className={`input ${errors.password ? 'input-error' : ''}`}
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* User Type */}
            <div>
              <label className="label">Я є</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  htmlFor="type-parent"
                  className="relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all hover:border-primary-dark has-[:checked]:border-primary has-[:checked]:bg-primary-light has-[:checked]:text-primary-dark"
                >
                  <input
                    id="type-parent"
                    type="radio"
                    value="PARENT"
                    className="sr-only"
                    {...register('userType')}
                  />
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Батько
                  </span>
                </label>
                <label
                  htmlFor="type-educator"
                  className="relative flex cursor-pointer items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all hover:border-secondary-dark has-[:checked]:border-secondary has-[:checked]:bg-secondary-light has-[:checked]:text-secondary-dark"
                >
                  <input
                    id="type-educator"
                    type="radio"
                    value="EDUCATOR"
                    className="sr-only"
                    {...register('userType')}
                  />
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Педагог
                  </span>
                </label>
              </div>
              {errors.userType && (
                <p className="mt-1 text-xs text-red-500">{errors.userType.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="register-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Створення…
                </span>
              ) : (
                'Створити акаунт'
              )}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          Вже маєте акаунт?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
