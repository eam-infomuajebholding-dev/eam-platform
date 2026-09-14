import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCommandCenterDelegation,
  fetchCommandCenterDelegations,
  revokeCommandCenterDelegation,
} from '@/features/command-center/api/commandCenterClient';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CommandCenterDelegationsPanel() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  const delegationsQuery = useQuery({
    queryKey: ['operations', 'command-center', 'delegations'],
    queryFn: fetchCommandCenterDelegations,
  });

  const createMutation = useMutation({
    mutationFn: () => createCommandCenterDelegation({ delegate_email: email, note: note || undefined }),
    onSuccess: async () => {
      setEmail('');
      setNote('');
      await queryClient.invalidateQueries({ queryKey: ['operations', 'command-center', 'delegations'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (delegationId: number) => revokeCommandCenterDelegation(delegationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['operations', 'command-center', 'delegations'] });
    },
  });

  return (
    <section id="delegations" className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-surface">
      <h3 className="text-lg font-bold text-ink dark:text-white">{t('commandCenter.delegations.title')}</h3>
      <p className="mt-1 text-sm text-ink-secondary">{t('commandCenter.delegations.subtitle')}</p>

      <form
        className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void createMutation.mutateAsync();
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('commandCenter.delegations.emailPlaceholder')}
          className="eam-input"
        />
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('commandCenter.delegations.notePlaceholder')}
          className="eam-input"
        />
        <button type="submit" className="eam-btn-primary" disabled={createMutation.isPending}>
          {t('commandCenter.delegations.grant')}
        </button>
      </form>

      {createMutation.isError ? (
        <p className="mt-3 text-sm text-red-600">{t('commandCenter.delegations.error')}</p>
      ) : null}

      <ul className="mt-5 space-y-2">
        {(delegationsQuery.data ?? []).map((delegation) => (
          <li
            key={delegation.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-soft-border/70 px-4 py-3 dark:border-white/10"
          >
            <div>
              <p className="font-medium text-ink dark:text-white">{delegation.delegate_email}</p>
              <p className="text-xs text-ink-muted">
                {delegation.delegate_name ?? delegation.delegate_user_id}
                {delegation.note ? ` — ${delegation.note}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
              onClick={() => void revokeMutation.mutateAsync(delegation.id)}
            >
              {t('commandCenter.delegations.revoke')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
