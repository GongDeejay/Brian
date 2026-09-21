/**
 * 数据服务客户端。
 *
 * 约定：
 *  - 登录态走 httpOnly cookie，因此所有请求必须带 `credentials: 'include'`。
 *  - 后端只返回机器可读的 `error` 码，界面文案由前端按语言解析
 *    （键名 `api.error.<code>`，与 api/lib/validate.js 的 ERROR_CODES 对应）。
 *  - 网络层失败与业务错误都统一抛 `ApiError`，调用方只需处理一种异常。
 *
 * 生产环境前端与 API 同源（nginx 将 /api/ 反代到本机 3011 端口）；
 * 本地开发时由 vite.config.ts 的 dev proxy 转发。
 */

export type ApiErrorCode =
  | 'invalid_request'
  | 'invalid_email'
  | 'weak_password'
  | 'email_taken'
  | 'invalid_credentials'
  | 'rate_limited'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'registration_closed'
  | 'conflict'
  | 'server_error'
  | 'network'
  | 'unknown';

export interface ApiUser {
  id: number;
  email: string;
  displayName: string | null;
  role: 'participant' | 'researcher';
  consentVersion: string | null;
  consentedAt: string | null;
}

/** 上报给服务器的一条测评记录。 */
export interface SyncRecord {
  /** 幂等键：必须稳定，重复上传同一记录不会产生第二条。 */
  clientId: string;
  app: 'wm' | 'neuro';
  task: string;
  /** ISO8601 时间字符串 */
  startedAt: string;
  durationSeconds?: number;
  loadConfig?: unknown;
  metrics: unknown;
  appVersion?: string;
  lang?: string;
  subjectCode?: string | null;
}

export interface UploadResult {
  accepted: string[];
  duplicates: string[];
  failed: string[];
  acceptedCount: number;
  duplicateCount: number;
  failedCount: number;
}

export interface RemoteSession {
  clientId: string;
  subjectCode: string | null;
  app: string;
  task: string;
  startedAt: string;
  durationSeconds: number | null;
  loadConfig: unknown;
  metrics: unknown;
  appVersion: string | null;
  lang: string | null;
}

export interface SubjectSummary {
  id: number;
  code: string;
  label: string | null;
  createdAt: string;
  sessionCount: number;
}

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly retryAfterSeconds?: number;

  constructor(code: ApiErrorCode, status: number, retryAfterSeconds?: number) {
    super(`API error: ${code} (HTTP ${status})`);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api';

const KNOWN_CODES: ReadonlySet<string> = new Set<ApiErrorCode>([
  'invalid_request',
  'invalid_email',
  'weak_password',
  'email_taken',
  'invalid_credentials',
  'rate_limited',
  'unauthorized',
  'forbidden',
  'not_found',
  'registration_closed',
  'conflict',
  'server_error',
]);

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  /** 是否把响应当作原始文本（导出类接口用），默认解析 JSON。 */
  raw?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, raw = false } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      // 登录态存在 httpOnly cookie 里，必须显式带上凭据。
      credentials: 'include',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch 只在网络层失败时抛异常（DNS、断网、CORS 预检失败等）。
    throw new ApiError('network', 0);
  }

  if (!response.ok) {
    let code: ApiErrorCode = 'unknown';
    let retryAfterSeconds: number | undefined;

    try {
      const payload = (await response.json()) as { error?: string; retryAfterSeconds?: number };
      if (payload?.error && KNOWN_CODES.has(payload.error)) code = payload.error as ApiErrorCode;
      if (typeof payload?.retryAfterSeconds === 'number') retryAfterSeconds = payload.retryAfterSeconds;
    } catch {
      // 响应不是 JSON（例如 nginx 返回的 502 页面），保持 unknown。
    }

    // 401 统一映射为 unauthorized，便于界面提示“登录已过期”。
    if (response.status === 401) code = 'unauthorized';
    throw new ApiError(code, response.status, retryAfterSeconds);
  }

  if (raw) return (await response.text()) as unknown as T;
  if (response.status === 204) return undefined as unknown as T;
  return (await response.json()) as T;
}

// ---------------------------------------------------------------- 认证

export async function fetchMe(): Promise<ApiUser | null> {
  const data = await request<{ user: ApiUser | null }>('/auth/me');
  return data.user ?? null;
}

export async function register(input: {
  email: string;
  password: string;
  displayName?: string;
  consentVersion?: string;
}): Promise<ApiUser> {
  const data = await request<{ user: ApiUser }>('/auth/register', { method: 'POST', body: input });
  return data.user;
}

export async function login(input: { email: string; password: string }): Promise<ApiUser> {
  const data = await request<{ user: ApiUser }>('/auth/login', { method: 'POST', body: input });
  return data.user;
}

export async function logout(): Promise<void> {
  await request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

export async function submitConsent(version: string): Promise<void> {
  await request<{ ok: boolean }>('/auth/consent', { method: 'POST', body: { version } });
}

// ---------------------------------------------------------------- 测评记录

export async function uploadSessions(records: SyncRecord[]): Promise<UploadResult> {
  return request<UploadResult>('/sessions', { method: 'POST', body: { sessions: records } });
}

export async function fetchSessions(limit = 500): Promise<RemoteSession[]> {
  const data = await request<{ sessions: RemoteSession[] }>(`/sessions?limit=${limit}`);
  return data.sessions ?? [];
}

// ---------------------------------------------------------------- 受试者编号

export async function claimSubject(code: string): Promise<{ code: string }> {
  return request<{ code: string }>('/subjects/claim', { method: 'POST', body: { code } });
}

export async function fetchMySubjects(): Promise<SubjectSummary[]> {
  const data = await request<{ subjects: SubjectSummary[] }>('/subjects/mine');
  return data.subjects ?? [];
}

// ---------------------------------------------------------------- 数据主体权利

/** 触发浏览器下载本人全部数据（JSON）。 */
export async function exportMyData(): Promise<void> {
  const text = await request<string>('/me/export', { raw: true });
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `brian-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // 立刻 revoke 会让部分浏览器中断下载，延后一拍再释放。
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** 删除账号与全部数据（不可撤销）。 */
export async function deleteMyAccount(): Promise<void> {
  await request<{ ok: boolean }>('/me', { method: 'DELETE' });
}

// ---------------------------------------------------------------- 研究者视图

export interface ResearchOverview {
  totals: { participants: number; subjects: number; sessions: number; codedSubjects: number };
  byTask: { app: string; task: string; count: number; lastAt: string | null }[];
}

export interface ResearchSubject {
  id: number;
  code: string;
  label: string | null;
  note: string | null;
  createdAt: string;
  ownerEmail: string | null;
  sessionCount: number;
  lastSessionAt: string | null;
}

export async function researchOverview(): Promise<ResearchOverview> {
  return request<ResearchOverview>('/research/overview');
}

export async function researchSubjects(): Promise<ResearchSubject[]> {
  const data = await request<{ subjects: ResearchSubject[] }>('/subjects');
  return data.subjects ?? [];
}

/** 研究者批量创建受试者编号。 */
export async function createSubjectCodes(codes: string[], label?: string): Promise<{ created: string[]; existing: string[] }> {
  return request<{ created: string[]; existing: string[] }>('/subjects', {
    method: 'POST',
    body: { codes, label },
  });
}

export async function researchSessions(filter: {
  subjectCode?: string;
  app?: string;
  limit?: number;
} = {}): Promise<RemoteSession[]> {
  const params = new URLSearchParams();
  if (filter.subjectCode) params.set('subjectCode', filter.subjectCode);
  if (filter.app) params.set('app', filter.app);
  params.set('limit', String(filter.limit ?? 1000));
  const data = await request<{ sessions: RemoteSession[] }>(`/research/sessions?${params.toString()}`);
  return data.sessions ?? [];
}

/** 下载全量 CSV（研究者）。 */
export async function downloadResearchCsv(subjectCode?: string): Promise<void> {
  const query = subjectCode ? `?subjectCode=${encodeURIComponent(subjectCode)}` : '';
  const text = await request<string>(`/research/export.csv${query}`, { raw: true });
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `brian-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function health(): Promise<boolean> {
  try {
    const data = await request<{ ok: boolean }>('/health');
    return data.ok === true;
  } catch {
    return false;
  }
}
