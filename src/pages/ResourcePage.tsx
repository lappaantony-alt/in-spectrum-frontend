import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getResourceById } from '../api/resources';
import type { ResourceResponse } from '../api/types';
import { getLocalVideoUrl } from '../lib/videoMapping';

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  VIDEO: { label: 'Відео', icon: '🎬', color: 'text-secondary-dark', bg: 'bg-secondary-light' },
  TEXT: { label: 'Стаття', icon: '📄', color: 'text-primary-dark', bg: 'bg-primary-light' },
  IMAGE: { label: 'Зображення', icon: '🖼️', color: 'text-accent-dark', bg: 'bg-accent-light' },
};

const audienceConfig: Record<string, { label: string; icon: string }> = {
  HOME: { label: 'Дім', icon: '🏠' },
  CLASS: { label: 'Клас', icon: '🏫' },
  BOTH: { label: 'Дім і клас', icon: '🏠🏫' },
};

export function ResourcePage() {
  const { resourceId } = useParams<{ resourceId: string }>();

  const {
    data: resource,
    isLoading,
    isError,
    error,
  } = useQuery<ResourceResponse>({
    queryKey: ['resource', resourceId],
    queryFn: () => getResourceById(resourceId!),
    enabled: !!resourceId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Завантаження ресурсу…</p>
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
          <h2 className="text-lg font-semibold text-text-primary">Ресурс не знайдено</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {(error as Error)?.message || 'Не вдалося завантажити цей ресурс.'}
          </p>
          <Link to="/plan" className="btn-primary mt-4 inline-flex">
            Повернутися до плану
          </Link>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  const type = typeConfig[resource.type] || typeConfig.TEXT;
  const audience = audienceConfig[resource.audience] || audienceConfig.BOTH;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        to="/plan"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Повернутися до плану
      </Link>

      {/* Header Card */}
      <div className="card">
        <div className="flex flex-wrap items-start gap-4">
          {/* Type Badge */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${type.bg}`}>
            <span className="text-2xl">{type.icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-text-primary">{resource.title}</h1>

            {/* Meta Tags */}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${type.bg} ${type.color}`}>
                {type.icon} {type.label}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-text-secondary">
                {audience.icon} {audience.label}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        {resource.description && (
          <div className="mt-5 border-t border-gray-100 pt-5">
            <h2 className="mb-2 text-sm font-semibold text-text-primary">Опис</h2>
            <p className="text-sm leading-relaxed text-text-secondary">{resource.description}</p>
          </div>
        )}
      </div>

      {/* Content — TEXT type */}
      {resource.type === 'TEXT' && resource.content && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Зміст</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
            {resource.content}
          </div>
        </div>
      )}

      {/* Content — VIDEO type */}
      {resource.type === 'VIDEO' && (getLocalVideoUrl(resource.title) || resource.url) && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Відео</h2>

          {/* Local Video Match */}
          {getLocalVideoUrl(resource.title) ? (
            <div className="aspect-video overflow-hidden rounded-xl bg-black shadow-sm border border-gray-100">
              <video
                controls
                src={getLocalVideoUrl(resource.title)!}
                className="h-full w-full object-contain"
              >
                Ваш браузер не підтримує відео.
              </video>
            </div>
          ) : isEmbeddableVideo(resource.url || '') ? (
            /* YouTube / Vimeo embed detection */
            <div className="aspect-video overflow-hidden rounded-xl">
              <iframe
                src={getEmbedUrl(resource.url || '')}
                title={resource.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={resource.url || ''}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-light transition-transform group-hover:scale-110">
                <svg className="h-5 w-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
                  Дивитися відео
                </p>
                <p className="truncate text-xs text-text-secondary">{resource.url}</p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Content — IMAGE type */}
      {resource.type === 'IMAGE' && resource.url && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Зображення</h2>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light transition-transform group-hover:scale-110">
              <span className="text-lg">🖼️</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
                Переглянути зображення
              </p>
              <p className="truncate text-xs text-text-secondary">{resource.url}</p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* General link for TEXT with external URL */}
      {resource.type === 'TEXT' && resource.url && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Зовнішнє посилання</h2>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-gray-200 p-4 transition-all hover:border-primary/30 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light transition-transform group-hover:scale-110">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
                Відкрити ресурс
              </p>
              <p className="truncate text-xs text-text-secondary">{resource.url}</p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {/* Metadata footer */}
      <div className="text-xs text-text-secondary">
        <p>
          Створено{' '}
          {new Date(resource.createdAt).toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {resource.updatedAt && resource.updatedAt !== resource.createdAt && (
            <>
              {' · Оновлено '}
              {new Date(resource.updatedAt).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function isEmbeddableVideo(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

function getEmbedUrl(url: string): string {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return url;
}
