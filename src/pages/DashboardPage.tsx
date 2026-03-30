import { useAuth } from '../auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { getLatestAssessment } from '../api/assessments';
import { getCurrentPlan } from '../api/plans';
import type { AssessmentResponse, PlanResponse } from '../api/types';
import axios from 'axios';

export function DashboardPage() {
  const { user } = useAuth();

  const {
    data: assessment,
    isLoading: isAssessmentLoading,
    isError: isAssessmentError,
  } = useQuery<AssessmentResponse>({
    queryKey: ['latestAssessment', user?.id],
    queryFn: getLatestAssessment,
    enabled: !!user?.id,
  });

  const {
    data: plan,
    isLoading: isPlanLoading,
    isError: isPlanError,
    error: planError,
  } = useQuery<PlanResponse>({
    queryKey: ['currentPlan', user?.id],
    queryFn: getCurrentPlan,
    enabled: !!user?.id,
  });

  const planIs404 =
    isPlanError &&
    axios.isAxiosError(planError) &&
    planError.response?.status === 404;

  const hasAssessment = !!assessment && !isAssessmentError;
  const hasPlan = !!plan && !isPlanError;

  const doneCount = hasPlan
    ? plan.items.filter((i) => i.status === 'DONE').length
    : 0;
  const totalCount = hasPlan ? plan.items.length : 0;

  function renderAssessmentValue() {
    if (isAssessmentLoading) return <SkeletonValue />;
    if (hasAssessment) {
      return (
        <span>
          Пройдено{' '}
          <span className="text-sm font-normal text-text-secondary">
            {new Date(assessment.submittedAt).toLocaleDateString('uk-UA')}
          </span>
        </span>
      );
    }
    return 'Не розпочато';
  }

  function renderPlanValue() {
    if (isPlanLoading) return <SkeletonValue />;
    if (hasPlan) {
      return `${plan.items.length} ресурсів`;
    }
    if (planIs404) return 'Ще не створено';
    return 'Ще не створено';
  }

  function renderProgressValue() {
    if (isPlanLoading) return <SkeletonValue />;
    if (hasPlan) {
      return (
        <span>
          {doneCount}{' '}
          <span className="text-sm font-normal text-text-secondary">
            / {totalCount} виконано
          </span>
        </span>
      );
    }
    return '—';
  }

  const showGettingStarted = !isAssessmentLoading && !hasAssessment;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Привіт, {user?.name?.split(' ')[0] || ''} 👋
        </h1>
        <p className="mt-1 text-text-secondary">
          Ось огляд вашого навчального шляху.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/assessment"
          className="card group transition-all hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light transition-transform group-hover:scale-110">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-secondary">Оцінювання</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {renderAssessmentValue()}
          </p>
        </Link>

        <Link
          to="/plan"
          className="card group transition-all hover:shadow-md"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-light transition-transform group-hover:scale-110">
            <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-secondary">Навчальний план</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {renderPlanValue()}
          </p>
        </Link>

        <Link
          to="/plan"
          className="card group transition-all hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light transition-transform group-hover:scale-110">
            <svg className="h-5 w-5 text-accent-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-sm font-medium text-text-secondary">Виконання плану</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {renderProgressValue()}
          </p>
        </Link>
      </div>

      {/* Getting Started */}
      {showGettingStarted && (
        <div className="card border-l-4 border-l-primary">
          <h2 className="text-lg font-semibold text-text-primary">Починаємо</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Пройдіть оцінювання, щоб отримати персоналізований навчальний план
            для потреб вашої дитини.
          </p>
          <div className="mt-4">
            <Link to="/assessment" className="btn-primary">
              Розпочати оцінювання
            </Link>
          </div>
        </div>
      )}

      {/* Already has a plan — summary */}
      {hasPlan && (
        <div className="card border-l-4 border-l-secondary">
          <h2 className="text-lg font-semibold text-text-primary">
            Ваш план активний
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            {doneCount === totalCount && totalCount > 0
              ? 'Вітаємо! Ви виконали всі пункти плану. 🎉'
              : `Виконано ${doneCount} з ${totalCount} пунктів. Продовжуйте!`}
          </p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
              style={{
                width: `${totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%`,
              }}
            />
          </div>
          <div className="mt-4">
            <Link to="/plan" className="btn-secondary">
              Перейти до плану
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonValue() {
  return (
    <span className="inline-block h-5 w-24 animate-pulse rounded-lg bg-gray-200" />
  );
}
