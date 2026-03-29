import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getCurrentPlan, updatePlanItemStatus } from '../api/plans';
import { createProgressEntry, listProgressEntries } from '../api/progress';
import type {
  PlanResponse,
  PlanItemResponse,
  ProgressEntryResponse,
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function PlanPage() {
  const queryClient = useQueryClient();
  const [selectedPlanItemId, setSelectedPlanItemId] = useState<string | null>(null);
  const [progressDate, setProgressDate] = useState(getTodayString());
  const [progressNote, setProgressNote] = useState('');
  const [progressFormError, setProgressFormError] = useState<string | null>(null);

  const {
    data: plan,
    isLoading,
    isError,
    error,
  } = useQuery<PlanResponse>({
    queryKey: ['currentPlan'],
    queryFn: getCurrentPlan,
  });

  const {
    data: progressHistory,
    isLoading: isProgressLoading,
  } = useQuery<ProgressEntryResponse[]>({
    queryKey: ['progress', selectedPlanItemId],
    queryFn: () => listProgressEntries(selectedPlanItemId!),
    enabled: !!selectedPlanItemId,
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
      await queryClient.cancelQueries({ queryKey: ['currentPlan'] });

      const previous = queryClient.getQueryData<PlanResponse>(['currentPlan']);

      queryClient.setQueryData<PlanResponse>(['currentPlan'], (old) => {
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
        queryClient.setQueryData(['currentPlan'], context.previous);
      }
      toast.error('Не вдалося оновити статус.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlan'] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({
      planItemId,
      entryDate,
      note,
    }: {
      planItemId: string;
      entryDate: string;
      note?: string;
    }) =>
      createProgressEntry(planItemId, {
        entryDate,
        note: note || null,
      }),
    onSuccess: () => {
      toast.success('Запис прогресу збережено!');
      setProgressNote('');
      setProgressDate(getTodayString());
      setProgressFormError(null);
      queryClient.invalidateQueries({ queryKey: ['progress', selectedPlanItemId] });
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as { message?: string })?.message ||
          'Не вдалося зберегти запис прогресу.';
        setProgressFormError(msg);
      } else {
        setProgressFormError('Сталася непередбачена помилка.');
      }
    },
  });

  const handleStatusChange = (
    planItemId: string,
    newStatus: PlanItemResponse['status'],
  ) => {
    statusMutation.mutate({ planItemId, status: newStatus });
  };

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProgressFormError(null);

    if (!selectedPlanItemId) return;

    if (!progressDate) {
      setProgressFormError('Будь ласка, оберіть дату.');
      return;
    }

    progressMutation.mutate({
      planItemId: selectedPlanItemId,
      entryDate: progressDate,
      note: progressNote.trim() || undefined,
    });
  };

  const handleOpenProgress = (planItemId: string) => {
    if (selectedPlanItemId === planItemId) {
      setSelectedPlanItemId(null);
    } else {
      setSelectedPlanItemId(planItemId);
      setProgressDate(getTodayString());
      setProgressNote('');
      setProgressFormError(null);
    }
  };

  const selectedItem = plan?.items.find((i) => i.id === selectedPlanItemId);

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
              Плану ще немає
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
          const isSelected = selectedPlanItemId === item.id;
          return (
            <div key={item.id}>
              <div
                id={`plan-item-${item.id}`}
                className={`card group transition-all duration-200 hover:shadow-md ${
                  item.status === 'DONE' ? 'opacity-75' : ''
                } ${isSelected ? 'ring-2 ring-primary/30' : ''}`}
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

                    {/* Action Buttons Row */}
                    <div className="mt-2 flex flex-wrap items-center gap-3">
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
                      <button
                        id={`progress-toggle-${item.id}`}
                        onClick={() => handleOpenProgress(item.id)}
                        className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? 'text-secondary-dark'
                            : 'text-secondary hover:text-secondary-dark'
                        }`}
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
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        {isSelected ? 'Сховати прогрес' : 'Відстежити прогрес'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Panel — inline below selected item */}
              {isSelected && (
                <div className="mt-2 overflow-hidden rounded-2xl border border-secondary/20 bg-white shadow-sm transition-all">
                  <div className="border-b border-gray-100 bg-secondary-light/40 px-6 py-4">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Прогрес — {selectedItem?.resource.title}
                    </h3>
                  </div>

                  <div className="grid gap-6 p-6 lg:grid-cols-2">
                    {/* Add Progress Form */}
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Новий запис
                      </h4>
                      <form
                        id="progress-form"
                        onSubmit={handleProgressSubmit}
                        className="space-y-3"
                      >
                        <div>
                          <label htmlFor="progress-date" className="label">
                            Дата
                          </label>
                          <input
                            id="progress-date"
                            type="date"
                            value={progressDate}
                            onChange={(e) => setProgressDate(e.target.value)}
                            max={getTodayString()}
                            className="input"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="progress-note" className="label">
                            Нотатка{' '}
                            <span className="font-normal text-text-secondary">
                              (необов'язково)
                            </span>
                          </label>
                          <textarea
                            id="progress-note"
                            value={progressNote}
                            onChange={(e) => setProgressNote(e.target.value)}
                            rows={3}
                            placeholder="Що ви спостерігали?"
                            className="input resize-none"
                          />
                        </div>

                        {progressFormError && (
                          <div
                            id="progress-form-error"
                            className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                          >
                            <svg
                              className="mt-0.5 h-4 w-4 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {progressFormError}
                          </div>
                        )}

                        <button
                          id="progress-submit"
                          type="submit"
                          disabled={progressMutation.isPending}
                          className="btn-secondary w-full"
                        >
                          {progressMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Збереження…
                            </span>
                          ) : (
                            'Зберегти запис'
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Progress History */}
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Історія
                      </h4>

                      {isProgressLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-3 border-secondary border-t-transparent" />
                        </div>
                      ) : !progressHistory || progressHistory.length === 0 ? (
                        <div className="rounded-xl bg-gray-50 px-4 py-8 text-center">
                          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-light">
                            <svg
                              className="h-5 w-5 text-secondary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-text-secondary">
                            Записів ще немає.
                          </p>
                          <p className="mt-0.5 text-xs text-text-secondary/70">
                            Додайте перший запис вище.
                          </p>
                        </div>
                      ) : (
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                          {[...progressHistory]
                            .sort(
                              (a, b) =>
                                new Date(b.entryDate).getTime() -
                                new Date(a.entryDate).getTime(),
                            )
                            .map((entry) => (
                              <div
                                key={entry.id}
                                className="group rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-secondary/30"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                                    <svg
                                      className="h-3.5 w-3.5 text-secondary"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {formatDate(entry.entryDate)}
                                  </span>
                                  <span className="text-[10px] text-text-secondary/60">
                                    Додано {formatDate(entry.createdAt)}
                                  </span>
                                </div>
                                {entry.note && (
                                  <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                                    {entry.note}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
