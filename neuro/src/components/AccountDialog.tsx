import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  BarChart3,
  Check,
  Download,
  KeyRound,
  LogIn,
  LogOut,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { useI18n, type MessageKey } from '../i18n';
import { useDialogA11y } from '../hooks/useDialogA11y';
import { CONSENT_VERSION, useAuth } from '../context/AuthContext';
import { localRecordStats, syncPendingRecords } from '../services/sessionSync';
import { ResearcherDialog } from './ResearcherDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'signIn' | 'register';

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

const primaryButton =
  'inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50';

const secondaryButton =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50';

const dangerButton =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-900/50 disabled:cursor-not-allowed disabled:opacity-50';

/** 知情同意的 5 条要点键，顺序与文案和 common.ts 中一一对应。 */
const CONSENT_POINTS: MessageKey[] = [
  'consent.point1',
  'consent.point2',
  'consent.point3',
  'consent.point4',
  'consent.point5',
];

export const AccountDialog = ({ isOpen, onClose }: Props) => {
  const { t, tList, lang } = useI18n();
  const auth = useAuth();

  const [tab, setTab] = useState<Tab>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [acceptConsent, setAcceptConsent] = useState(false);
  const [localOnly, setLocalOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<MessageKey | null>(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState(() => localRecordStats());
  const [isResearcherOpen, setIsResearcherOpen] = useState(false);

  const { panelRef, handleBackdropMouseDown } = useDialogA11y({ isOpen, onClose });

  // 打开时刷新一次本地记录统计（任务完成后重新打开才需要）。
  useEffect(() => {
    if (isOpen) setStats(localRecordStats());
  }, [isOpen]);

  const errorKey = useMemo<MessageKey | null>(() => {
    if (formError) return formError;
    if (!auth.lastError) return null;
    // 后端只返回错误码，这里映射到当前语言的文案。
    return `api.error.${auth.lastError}` as MessageKey;
  }, [formError, auth.lastError]);

  const resetForm = useCallback(() => {
    setPassword('');
    setConfirm('');
    setFormError(null);
    auth.clearError();
  }, [auth]);

  const handleSignIn = useCallback(async () => {
    setFormError(null);
    auth.clearError();
    if (!email.trim() || !password) {
      setFormError('api.error.invalid_request');
      return;
    }
    setBusy(true);
    const ok = await auth.signIn(email.trim(), password);
    setBusy(false);
    if (ok) {
      resetForm();
      setNotice(null);
    }
  }, [auth, email, password, resetForm]);

  const handleRegister = useCallback(async () => {
    setFormError(null);
    auth.clearError();
    if (!email.trim()) {
      setFormError('api.error.invalid_email');
      return;
    }
    if (password !== confirm) {
      setFormError('auth.passwordMismatch');
      return;
    }
    // 注册即代表同意上传数据；未勾选时不允许提交，避免“默认同意”。
    if (!acceptConsent) {
      setFormError('auth.consentRequired');
      return;
    }
    setBusy(true);
    const ok = await auth.signUp({ email: email.trim(), password, displayName: displayName.trim() || undefined });
    setBusy(false);
    if (ok) {
      resetForm();
      setNotice(t('auth.registerSuccess'));
      setLocalOnly(false);
    }
  }, [acceptConsent, auth, confirm, displayName, email, password, resetForm, t]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    const outcome = await syncPendingRecords(lang, null);
    setSyncing(false);
    setStats(localRecordStats());
    if (outcome.uploaded > 0) {
      setNotice(t('account.syncDone', { count: outcome.uploaded }));
    } else if (outcome.error) {
      setNotice(t('account.syncFailed'));
    } else {
      setNotice(t('account.syncUpToDate'));
    }
  }, [lang, t]);

  const handleBind = useCallback(async () => {
    const code = subjectCode.trim();
    if (!code) return;
    const ok = await auth.bindSubject(code);
    if (ok) {
      setNotice(t('account.bindSuccess', { code }));
      setSubjectCode('');
    }
  }, [auth, subjectCode, t]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm(t('account.deleteConfirm'))) return;
    const ok = await auth.removeAccount();
    if (ok) setNotice(t('account.deleteSuccess'));
  }, [auth, t]);

  if (!isOpen) return null;

  const signedIn = auth.user !== null;
  const needsConsent = signedIn && !auth.hasConsented;

  /*
   * 用 portal 挂到 document.body。
   *
   * 这两个弹窗由 Header 渲染，而 Header 带 backdrop-blur —— backdrop-filter 会为
   * fixed 后代创建包含块，使 `position: fixed` 退化为相对 Header 定位，页面滚动时
   * 弹窗会跟着移动、顶部被裁掉。portal 让弹窗真正相对视口定位。
   */
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-dialog-title"
        className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="account-dialog-title" className="flex items-center gap-2 text-lg font-bold text-white">
              <ShieldCheck className="h-5 w-5 text-indigo-400" aria-hidden="true" />
              {signedIn ? t('account.menuTitle') : t('auth.dialogTitle')}
            </h2>
            {!signedIn && <p className="mt-1 text-xs text-slate-400">{t('auth.dialogIntro')}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label={t('common.close')}
            title={t('common.close')}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* 错误与提示 */}
        {errorKey && (
          <p
            role="alert"
            className="mb-3 flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-200"
          >
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t(errorKey)}</span>
          </p>
        )}
        {notice && (
          <p className="mb-3 flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{notice}</span>
          </p>
        )}

        {/* ---------------------------------------------------- 未登录 */}
        {!signedIn && (
          <>
            <div role="tablist" aria-label={t('auth.dialogTitle')} className="mb-4 flex gap-1 rounded-xl bg-slate-800/60 p-1">
              {(['signIn', 'register'] as Tab[]).map((id) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={tab === id}
                  onClick={() => {
                    setTab(id);
                    resetForm();
                  }}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    tab === id ? 'bg-slate-900 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {id === 'signIn' ? t('auth.tabSignIn') : t('auth.tabRegister')}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-300">{t('account.email')}</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-300">{t('account.password')}</span>
                <input
                  type="password"
                  autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={inputClass}
                />
              </label>

              {tab === 'register' && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-300">{t('account.passwordConfirm')}</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(event) => setConfirm(event.target.value)}
                      placeholder={t('auth.passwordConfirmPlaceholder')}
                      className={inputClass}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-300">
                      {t('account.displayName')}
                    </span>
                    <input
                      type="text"
                      autoComplete="nickname"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder={t('auth.displayNamePlaceholder')}
                      className={inputClass}
                    />
                  </label>

                  {/* 知情同意：注册前必须显式勾选 */}
                  <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                    <p className="mb-1.5 text-xs font-semibold text-slate-200">{t('consent.title')}</p>
                    <ul className="mb-2 list-disc space-y-0.5 pl-4 text-[11px] leading-relaxed text-slate-400">
                      {tList(CONSENT_POINTS).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <label className="flex items-start gap-2 text-xs text-slate-200">
                      <input
                        type="checkbox"
                        checked={acceptConsent}
                        onChange={(event) => setAcceptConsent(event.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 accent-indigo-500"
                      />
                      <span>{t('consent.accept')}</span>
                    </label>
                    <p className="mt-1 text-[10px] text-slate-500">{t('consent.version', { version: CONSENT_VERSION })}</p>
                  </div>
                </>
              )}

              <button
                id="btn-auth-submit"
                type="button"
                onClick={tab === 'signIn' ? handleSignIn : handleRegister}
                disabled={busy}
                className={`${primaryButton} w-full`}
              >
                {tab === 'signIn' ? (
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                )}
                {busy
                  ? t('auth.working')
                  : tab === 'signIn'
                    ? t('auth.submitSignIn')
                    : t('auth.submitRegister')}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:text-slate-200"
              >
                {t('account.startAnonymous')}
              </button>
            </div>
          </>
        )}

        {/* ---------------------------------------------------- 需要同意 */}
        {needsConsent && !localOnly && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-amber-300">{t('consent.title')}</p>
            <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-300">
              {tList(CONSENT_POINTS).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-500">{t('consent.version', { version: CONSENT_VERSION })}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={async () => {
                  const ok = await auth.acceptConsent();
                  if (ok) setNotice(t('auth.registerSuccess'));
                }}
                className={`${primaryButton} flex-1`}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                {t('consent.accept')}
              </button>
              <button type="button" onClick={() => setLocalOnly(true)} className={`${secondaryButton} flex-1`}>
                {t('consent.decline')}
              </button>
            </div>
          </div>
        )}

        {needsConsent && localOnly && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-200">{t('consent.requiredTitle')}</p>
            <p className="text-xs leading-relaxed text-slate-400">{t('consent.requiredBody')}</p>
            <button type="button" onClick={() => setLocalOnly(false)} className={secondaryButton}>
              {t('consent.accept')}
            </button>
          </div>
        )}

        {/* ---------------------------------------------------- 已登录 */}
        {signedIn && !needsConsent && (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              {t('account.signedInAs', { name: auth.user?.displayName || auth.user?.email || '' })}
            </p>

            {/* 同步 */}
            <section className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-200">{t('account.syncSection')}</p>
              <p className="mb-2 text-xs text-slate-400">
                {t('account.localCount', { count: stats.total })}
                {stats.pending > 0 && ` · ${t('account.syncPending', { count: stats.pending })}`}
              </p>
              <button id="btn-account-sync" type="button" onClick={handleSync} disabled={syncing} className={secondaryButton}>
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {syncing ? t('account.syncing') : t('account.syncNow')}
              </button>
            </section>

            {/* 受试者编号 */}
            <section className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
              <p className="mb-1 text-xs font-semibold text-slate-200">{t('account.bindSubject')}</p>
              <p className="mb-2 text-[11px] text-slate-400">{t('auth.subjectHint')}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(event) => setSubjectCode(event.target.value)}
                  placeholder={t('account.bindSubjectPlaceholder')}
                  className={`${inputClass} flex-1`}
                />
                <button type="button" onClick={handleBind} className={secondaryButton}>
                  <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('common.confirm')}
                </button>
              </div>
              {auth.subjects.length > 0 ? (
                <p className="mt-2 text-[11px] text-slate-400">
                  {t('account.boundSubjects', { codes: auth.subjects.map((s) => s.code).join(', ') })}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500">{t('account.noBoundSubjects')}</p>
              )}
            </section>

            {/* 数据主体权利 */}
            <section className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-200">{t('account.dataSection')}</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={async () => {
                    await auth.downloadMyData();
                    setNotice(t('account.exportStarted'));
                  }}
                  className={`${secondaryButton} flex-1`}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('account.exportData')}
                </button>
                <button type="button" onClick={handleDelete} className={`${dangerButton} flex-1`}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('account.deleteAccount')}
                </button>
              </div>
            </section>

            {/* 研究者入口：只有 researcher 角色可见 */}
            {auth.user?.role === 'researcher' && (
              <button
                type="button"
                onClick={() => {
                  setIsResearcherOpen(true);
                }}
                className={`${secondaryButton} w-full`}
              >
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                {t('research.open')}
              </button>
            )}

            <button type="button" onClick={() => void auth.signOut()} className={`${secondaryButton} w-full`}>
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              {t('account.signOut')}
            </button>
          </div>
        )}
      </div>

      {/* 研究者视图叠在账号弹窗之上 */}
      <ResearcherDialog isOpen={isResearcherOpen} onClose={() => setIsResearcherOpen(false)} />
    </div>,
    document.body
  );
};
