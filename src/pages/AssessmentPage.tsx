import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAssessmentTemplate, createAssessment } from '../api/assessments';
import { generatePlan } from '../api/plans';
import type { AssessmentTemplate } from '../api/types';

export function AssessmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  const {
    data: template,
    isLoading,
    isError,
    error,
  } = useQuery<AssessmentTemplate>({
    queryKey: ['assessmentTemplate'],
    queryFn: getAssessmentTemplate,
  });

  const submitMutation = useMutation({
    mutationFn: async (submittedAnswers: Record<string, number>) => {
      const assessment = await createAssessment({ answers: submittedAnswers });
      await generatePlan({ assessmentId: assessment.id });
      return assessment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentPlan'] });
      queryClient.invalidateQueries({ queryKey: ['latestAssessment'] });
      toast.success('Оцінювання подано! Ваш план створено.');
      navigate('/plan');
    },
    onError: () => {
      toast.error('Не вдалося подати оцінювання. Спробуйте ще раз.');
    },
  });

  const handleSelect = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationErrors((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!template) return;

    const unanswered = template.questions
      .filter((q) => answers[q.id] === undefined)
      .map((q) => q.id);

    if (unanswered.length > 0) {
      setValidationErrors(new Set(unanswered));
      toast.error(`Будь ласка, дайте відповіді на всі запитання (залишилось ${unanswered.length}).`);
      const firstMissing = document.getElementById(`question-${unanswered[0]}`);
      firstMissing?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setValidationErrors(new Set());
    submitMutation.mutate(answers);
  };

  // Group questions by category
  const groupedQuestions = template?.questions.reduce(
    (acc, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      acc[q.category].push(q);
      return acc;
    },
    {} as Record<string, typeof template.questions>,
  );

  const categoryLabels: Record<string, string> = {
    TACTILE: 'Тактильна чутливість',
    AUDITORY: 'Слухова обробка',
    VISUAL: 'Зорова обробка',
    PROPRIOCEPTION: 'Пропріоцепція',
    ORAL: 'Оральна чутливість',
  };

  const categoryIcons: Record<string, string> = {
    TACTILE: '🤚',
    AUDITORY: '👂',
    VISUAL: '👁️',
    PROPRIOCEPTION: '🏃',
    ORAL: '👅',
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Завантаження оцінювання…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Не вдалося завантажити оцінювання</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {(error as Error)?.message || 'Щось пішло не так. Спробуйте ще раз.'}
          </p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">Спробувати знову

          </button>
        </div>
      </div>
    );
  }

  if (!template) return null;

  const totalQuestions = template.questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{template.title}</h1>
        <p className="mt-1 text-text-secondary">{template.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-text-primary">
            Прогрес: {answeredCount} / {totalQuestions}
          </span>
          <span className="font-semibold text-primary">{progressPercent}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Questions by Category */}
      {groupedQuestions &&
        Object.entries(groupedQuestions).map(([category, questions]) => (
          <div key={category} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center gap-2">
              <span className="text-xl">{categoryIcons[category] || '📋'}</span>
              <h2 className="text-lg font-semibold text-text-primary">
                {categoryLabels[category] || category}
              </h2>
            </div>

            {/* Questions */}
            {questions.map((question) => {
              const globalIndex = template.questions.findIndex((q) => q.id === question.id);
              const hasError = validationErrors.has(question.id);

              return (
                <div
                  key={question.id}
                  id={`question-${question.id}`}
                  className={`card transition-all duration-200 ${
                    hasError
                      ? 'border-red-300 ring-2 ring-red-100'
                      : answers[question.id] !== undefined
                        ? 'border-primary/30 bg-primary/[0.02]'
                        : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-text-secondary">
                      {globalIndex + 1}
                    </span>
                    <div className="flex-1 space-y-3">
                      <p className="text-sm font-medium leading-relaxed text-text-primary">
                        {question.text}
                      </p>

                      {/* Answer Scale */}
                      <div className="flex flex-wrap gap-2">
                        {template.answerScale.map((option) => {
                          const isSelected = answers[question.id] === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleSelect(question.id, option.value)}
                              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                isSelected
                                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                                  : 'bg-gray-50 text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>

                      {hasError && (
                        <p className="text-xs font-medium text-red-500">
                          Будь ласка, оберіть відповідь
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {/* Submit */}
      <div className="card sticky bottom-4 flex items-center justify-between border-primary/20 bg-surface-card/95 shadow-lg backdrop-blur-sm">
        <div className="text-sm text-text-secondary">
          {answeredCount === totalQuestions ? (
            <span className="font-medium text-primary">✓ Усі запитання мають відповіді</span>
          ) : (
            <span>Залишилось {totalQuestions - answeredCount} запитань</span>
          )}
        </div>
        <button
          id="assessment-submit"
          type="button"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="btn-primary"
        >
          {submitMutation.isPending ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Відправлення…
            </span>
          ) : (
            'Подати оцінювання'
          )}
        </button>
      </div>
    </div>
  );
}
