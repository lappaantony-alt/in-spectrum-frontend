import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getCurrentPlan } from '../api/plans';
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

export function ProgressPage() {
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
        const status = err.response?.status;
        if (status === 409) {
          setProgressFormError('Запис на цю дату вже існує.');
        } else {
          const msg =
            (err.response?.data as { message?: string })?.message ||
            'Не вдалося зберегти запис прогресу.';
          setProgressFormError(msg);
        }
      } else {
        setProgressFormError('Сталася непередбачена помилка.');
      }
    },
  });

  const handleSelectItem = (planItemId: string) => {
    if (selectedPlanItemId === planItemId) return;
    setSelectedPlanItemId(planItemId);
    setProgressDate(getTodayString());
    setProgressNote('');
    setProgressFormError(null);
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

  const selectedItem = plan?.items.find((i) => i.id === selectedPlanItemId);

  // Loading
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Завантаження прогресу…</p>
        </div>
      </div>
    );
  }

  // Error: no plan
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Прогрес поки недоступний
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Після створення плану та виконання завдань тут з’являться ваші записи прогресу.
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
            Не вдалося завантажити дані
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

  if (!plan || plan.items.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md text-center">
          <p className="text-text-secondary">
            Ваш план порожній. Спробуйте пройти оцінювання.
          </p>
          <Link to="/assessment" className="btn-primary mt-4 inline-flex">
            Пройти оцінювання
          </Link>
        </div>
      </div>
    );
  }

  const sortedItems = [...plan.items].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Відстеження прогресу
        </h1>
        <p className="mt-1 text-text-secondary">
          Оберіть пункт плану та додайте записи щодо виконання.
        </p>
      </div>

      {/* Main Layout: Items list + Detail panel */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* LEFT: Plan Items List */}
        <div className="space-y-2 lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Пункти плану
          </h2>
          {sortedItems.map((item) => {
            const config = statusConfig[item.status];
            const isSelected = selectedPlanItemId === item.id;
            return (
              <button
                key={item.id}
                id={`progress-item-${item.id}`}
                onClick={() => handleSelectItem(item.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-primary/40 bg-primary/[0.04] shadow-sm ring-2 ring-primary/20'
                    : 'border-gray-100 bg-surface-card hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg} text-sm font-bold ${config.color}`}
                  >
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-semibold ${
                        item.status === 'DONE'
                          ? 'text-text-secondary line-through'
                          : 'text-text-primary'
                      }`}
                    >
                      {item.resource.title}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      #{item.sortOrder} · {config.label}
                    </p>
                  </div>
                  {isSelected && (
                    <svg
                      className="h-4 w-4 shrink-0 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT: Progress Detail Panel */}
        <div className="lg:col-span-3">
          {!selectedPlanItemId ? (
            <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-light">
                  <svg
                    className="h-6 w-6 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text-primary">
                  Оберіть пункт плану
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  Щоб переглянути та додати записи прогресу.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Selected Item Header */}
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-light">
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      {selectedItem?.resource.title}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {selectedItem
                        ? statusConfig[selectedItem.status].label
                        : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Progress Form */}
              <div className="card">
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
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
                      onChange={(e) => {
                        e.target.setCustomValidity('');
                        setProgressDate(e.target.value);
                      }}
                      onInvalid={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.validity.rangeOverflow) {
                          target.setCustomValidity('Дата не може бути пізнішою за сьогоднішню');
                        } else if (target.validity.valueMissing) {
                          target.setCustomValidity('Будь ласка, оберіть дату.');
                        }
                      }}
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
              <div className="card">
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Історія записів
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
                      Додайте перший запис через форму вище.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
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
          )}
        </div>
      </div>
    </div>
  );
}
