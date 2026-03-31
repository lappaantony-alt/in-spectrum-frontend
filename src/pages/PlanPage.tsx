import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/useAuth';
import { getCurrentPlan, updatePlanItemStatus } from '../api/plans';
import type {
  PlanResponse,
  PlanItemResponse,
} from '../api/types';
import { Link } from 'react-router';
import axios from 'axios';

const statusConfig: Record<
  PlanItemResponse['status'],
  { label: string; color: string; bg: string; icon: string }
> = {
  TODO: {
    label: 'До виконання',
    color: 'text-text-secondary',
    bg: 'bg-gray-100',
    icon: '○',
  },
  DONE: {
    label: 'Виконано',
    color: 'text-primary-dark',
    bg: 'bg-primary-light',
    icon: '✓',
  },
  SKIPPED: {
    label: 'Пропущено',
    color: 'text-amber-700',
    bg: 'bg-accent-light',
    icon: '—',
  },
};

const typeIcons: Record<string, string> = {
  VIDEO: '🎬',
  TEXT: '📄',
  IMAGE: '🖼️',
};

const audienceLabels: Record<string, string> = {
  HOME: 'Дім',
  CLASS: 'Клас',
  BOTH: 'Дім і клас',
};

export function PlanPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: plan,
    isLoading,
    isError,
    error,
  } = useQuery<PlanResponse>({
    queryKey: ['currentPlan', user?.id],
    queryFn: getCurrentPlan,
    enabled: !!user?.id,
  });

  const statusMutation = useMutation({
    mutationFn: ({
      planItemId,
      status,
    }: {
      planItemId: string;
      status: PlanItemResponse['status'];
    }) => updatePlanItemStatus(planItemId, { status }),
    onMutate: async ({ planItemId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['currentPlan', user?.id] });

      const previous = queryClient.getQueryData<PlanResponse>(['currentPlan', user?.id]);

      queryClient.setQueryData<PlanResponse>(['currentPlan', user?.id], (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.id === planItemId ? { ...item, status } : item,
          ),
        };
      });

      return { previous };
    },
    onSuccess: () => {
      toast.success('Статус оновлено.');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['currentPlan', user?.id], context.previous);
      }
      toast.error('Не вдалося оновити статус.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlan', user?.id] });
    },
  });

  const handleStatusChange = (
    planItemId: string,
    newStatus: PlanItemResponse['status'],
  ) => {
    statusMutation.mutate({ planItemId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Завантаження плану…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    const is404 =
      axios.isAxiosError(error) && error.response?.status === 404;

    if (is404) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="card max-w-md text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-light">
              <svg
                className="h-7 w-7 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              План ще не створено
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Пройдіть оцінювання, щоб отримати персоналізований навчальний план.
            </p>
            <Link to="/assessment" className="btn-primary mt-5 inline-flex">
              Розпочати оцінювання
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            Не вдалося завантажити план
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Щось пішло не так. Спробуйте ще раз.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const sortedItems = [...plan.items].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const doneCount = plan.items.filter((i) => i.status === 'DONE').length;
  const totalCount = plan.items.length;
  const progressPercent =
    totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{plan.title}</h1>
        <p className="mt-1 text-text-secondary">
          Створено{' '}
          {new Date(plan.createdAt).toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Summary Card */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-secondary">
              Виконання
            </p>
            <p className="mt-0.5 text-2xl font-bold text-text-primary">
              {doneCount}{' '}
              <span className="text-base font-normal text-text-secondary">
                / {totalCount} пунктів
              </span>
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
            <span className="text-lg font-bold text-primary-dark">
              {progressPercent}%
            </span>
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Plan Items */}
      <div className="space-y-3">
        {sortedItems.map((item) => {
          const config = statusConfig[item.status];
          return (
            <div
              key={item.id}
              id={`plan-item-${item.id}`}
              className={`card group transition-all duration-200 hover:shadow-md ${
                item.status === 'DONE' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status Badge */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.bg} text-base font-bold ${config.color}`}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        to={`/resources/${item.resource.id}`}
                        className="text-sm font-semibold transition-colors hover:text-primary"
                      >
                        <h3
                          className={`${
                            item.status === 'DONE'
                              ? 'text-text-secondary line-through'
                              : 'text-text-primary'
                          } hover:text-primary`}
                        >
                          {item.resource.title}
                        </h3>
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                          {typeIcons[item.resource.type] || '📎'}{' '}
                          {item.resource.type}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-text-secondary">
                          {audienceLabels[item.resource.audience] ||
                            item.resource.audience}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-text-secondary">
                          #{item.sortOrder}
                        </span>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      id={`status-select-${item.id}`}
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target.value as PlanItemResponse['status'],
                        )
                      }
                      disabled={statusMutation.isPending}
                      className={`shrink-0 cursor-pointer rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${config.bg} ${config.color}`}
                    >
                      <option value="TODO">До виконання</option>
                      <option value="DONE">Виконано</option>
                      <option value="SKIPPED">Пропущено</option>
                    </select>
                  </div>

                  {/* Action Link */}
                  <div className="mt-2">
                    <Link
                      to={`/resources/${item.resource.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-dark"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Деталі
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalCount === 0 && (
        <div className="card py-12 text-center">
          <p className="text-text-secondary">
            Ваш план порожній. Спробуйте пройти оцінювання ще раз.
          </p>
          <Link to="/assessment" className="btn-primary mt-4 inline-flex">
            Пройти оцінювання
          </Link>
        </div>
      )}
    </div>
  );
}
