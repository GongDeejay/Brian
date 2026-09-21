/**
 * 输入校验。所有错误以**机器可读的错误码**返回，前端再翻译成用户语言 ——
 * 这样后端不需要知道界面语言，也不会把中文/英文混进 API 契约。
 */

export const ERROR_CODES = {
  invalidRequest: 'invalid_request',
  invalidEmail: 'invalid_email',
  weakPassword: 'weak_password',
  emailTaken: 'email_taken',
  invalidCredentials: 'invalid_credentials',
  rateLimited: 'rate_limited',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'not_found',
  registrationClosed: 'registration_closed',
  conflict: 'conflict',
  serverError: 'server_error',
};

/** 常见弱口令，直接拒绝（长度合格但过于常见的也要拦）。 */
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890',
  'qwertyuiop', 'qwerty123', 'iloveyou', 'admin123', 'administrator',
  'letmein123', 'welcome123', 'abc123456', 'passw0rd', 'p@ssw0rd',
  '11111111', '00000000', '88888888', '66666666',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value.trim());
}

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/** 返回 null 表示合格，否则返回错误码。 */
export function passwordProblem(value) {
  if (typeof value !== 'string') return ERROR_CODES.weakPassword;
  const password = value.normalize('NFKC');
  if (password.length < 10) return ERROR_CODES.weakPassword;
  if (password.length > 200) return ERROR_CODES.weakPassword;
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return ERROR_CODES.weakPassword;
  // 至少两类字符，避免纯数字口令
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes < 2) return ERROR_CODES.weakPassword;
  return null;
}

/** 截断并去除控制字符，防止超长输入与日志注入。 */
export function cleanString(value, maxLength = 200) {
  if (typeof value !== 'string') return null;
  // eslint-disable-next-line no-control-regex
  const stripped = value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  if (stripped.length === 0) return null;
  return stripped.slice(0, maxLength);
}

/** 受试者编号：字母数字与 - _ ，便于口头传达与手写。 */
export function isValidSubjectCode(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{2,64}$/.test(value);
}

/** 幂等键：前端生成，限制字符集与长度。 */
export function isValidClientId(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128 && /^[A-Za-z0-9_:.-]+$/.test(value);
}

export function isIsoDate(value) {
  if (typeof value !== 'string' || value.length < 10 || value.length > 40) return false;
  const time = Date.parse(value);
  return Number.isFinite(time);
}

/** 单条记录的 metrics 体积上限（防止用超大 JSON 撑爆数据库）。 */
export const MAX_METRICS_BYTES = 256 * 1024;
export const MAX_LOAD_CONFIG_BYTES = 8 * 1024;
export const MAX_BATCH_SIZE = 50;

export function jsonSize(value) {
  try {
    return Buffer.byteLength(JSON.stringify(value ?? null), 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}
