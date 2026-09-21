/* eslint-disable react-refresh/only-export-components */
/**
 * 登录态上下文。
 *
 * 设计取舍：
 *  - 登录态存在服务端 httpOnly cookie 里，前端**不保存任何 token**，
 *    因此 XSS 无法直接窃取登录态。
 *  - 打开应用时用 `/auth/me` 探测一次；失败按“未登录”处理，不阻塞匿名使用。
 *  - 未登录时平台功能完全不受影响，数据仍只写本机（见 sessionSync）。
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  ApiError,
  type ApiErrorCode,
  type ApiUser,
  claimSubject,
  deleteMyAccount,
  exportMyData,
  fetchMe,
  fetchMySubjects,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  submitConsent,
  type SubjectSummary,
} from '../services/authApi';

/** 与后端 BRIAN_CONSENT_VERSION 保持一致；条款变更时同步递增。 */
export const CONSENT_VERSION = '2026-09-1';

interface AuthValue {
  user: ApiUser | null;
  loading: boolean;
  /** 需要绑定编号的受试者列表（登录后才加载）。 */
  subjects: SubjectSummary[];
  /**
   * 当前用户是否已同意**当前版本**的条款。
   * 未登录时为 false（匿名使用不需要同意，因为不上传任何数据）。
   */
  hasConsented: boolean;
  lastError: ApiErrorCode | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (input: { email: string; password: string; displayName?: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  acceptConsent: () => Promise<boolean>;
  bindSubject: (code: string) => Promise<boolean>;
  downloadMyData: () => Promise<void>;
  removeAccount: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

function toErrorCode(error: unknown): ApiErrorCode {
  return error instanceof ApiError ? error.code : 'unknown';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [lastError, setLastError] = useState<ApiErrorCode | null>(null);

  const clearError = useCallback(() => setLastError(null), []);

  const loadSubjects = useCallback(async () => {
    try {
      setSubjects(await fetchMySubjects());
    } catch {
      // 编号列表不是关键路径，失败就静默保持为空。
      setSubjects([]);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const current = await fetchMe();
      setUser(current);
      if (current) await loadSubjects();
      else setSubjects([]);
    } catch {
      // 服务不可用时按未登录处理：匿名模式仍然完整可用。
      setUser(null);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [loadSubjects]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLastError(null);
      try {
        const next = await apiLogin({ email, password });
        setUser(next);
        await loadSubjects();
        return true;
      } catch (error) {
        setLastError(toErrorCode(error));
        return false;
      }
    },
    [loadSubjects]
  );

  const signUp = useCallback(
    async (input: { email: string; password: string; displayName?: string }) => {
      setLastError(null);
      try {
        const next = await apiRegister({ ...input, consentVersion: CONSENT_VERSION });
        setUser(next);
        setSubjects([]);
        return true;
      } catch (error) {
        setLastError(toErrorCode(error));
        return false;
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setLastError(null);
    try {
      await apiLogout();
    } catch {
      // 即使请求失败也要把本地状态清干净，避免界面停留在“已登录”假象。
    }
    setUser(null);
    setSubjects([]);
  }, []);

  const acceptConsent = useCallback(async () => {
    setLastError(null);
    try {
      await submitConsent(CONSENT_VERSION);
      setUser((prev) =>
        prev ? { ...prev, consentVersion: CONSENT_VERSION, consentedAt: new Date().toISOString() } : prev
      );
      return true;
    } catch (error) {
      setLastError(toErrorCode(error));
      return false;
    }
  }, []);

  const bindSubject = useCallback(
    async (code: string) => {
      setLastError(null);
      try {
        await claimSubject(code);
        await loadSubjects();
        return true;
      } catch (error) {
        setLastError(toErrorCode(error));
        return false;
      }
    },
    [loadSubjects]
  );

  const downloadMyData = useCallback(async () => {
    setLastError(null);
    try {
      await exportMyData();
    } catch (error) {
      setLastError(toErrorCode(error));
    }
  }, []);

  const removeAccount = useCallback(async () => {
    setLastError(null);
    try {
      await deleteMyAccount();
      setUser(null);
      setSubjects([]);
      return true;
    } catch (error) {
      setLastError(toErrorCode(error));
      return false;
    }
  }, []);

  const hasConsented = user !== null && user.consentVersion === CONSENT_VERSION;

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      subjects,
      hasConsented,
      lastError,
      clearError,
      signIn,
      signUp,
      signOut,
      acceptConsent,
      bindSubject,
      downloadMyData,
      removeAccount,
      refresh,
    }),
    [
      user,
      loading,
      subjects,
      hasConsented,
      lastError,
      clearError,
      signIn,
      signUp,
      signOut,
      acceptConsent,
      bindSubject,
      downloadMyData,
      removeAccount,
      refresh,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 必须在 <AuthProvider> 内部使用 / useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
