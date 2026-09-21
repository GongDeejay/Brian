#!/usr/bin/env node
/**
 * 布局回归检查：页面级横向溢出。
 *
 * 为什么需要这个检查
 * ------------------
 * 英文文案普遍比中文长。当某个元素把文档撑得比视口宽时，浏览器会出现横向滚动条，
 * 用 `mx-auto` 居中的容器就会相对“更宽的文档”居中，视觉上表现为**内容整体偏左**。
 * 这类问题单测、类型检查、构建都发现不了，只能靠真实浏览器量。
 *
 * 已修过的一个真实案例：`sr-only`（position:absolute）元素放在 `overflow-x-auto`
 * 但自身 `position:static` 的滚动容器里时，会脱离该容器的裁剪、逃逸到外层，
 * 把整个文档撑宽 600+px。修法是给滚动容器加 `relative`，使其成为包含块。
 *
 * 用法：
 *   node serve.mjs site 8099 &
 *   node overflow-check.mjs http://127.0.0.1:8099
 *
 * Chrome 可执行文件路径按以下顺序解析：$CHROME_PATH → 常见系统路径 → puppeteer 缓存。
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import puppeteer from 'puppeteer-core';

const BASE = process.argv[2] || 'http://127.0.0.1:8099';
const WIDTHS = [390, 768, 1280, 1600];
const LANGS = ['zh', 'en'];

const ONLY = (process.env.CHECK_APPS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const TABLES = {
  wm: ['nback', 'ospan', 'change_detection', 'dashboard'],
  neuro: ['wcst', 'wpt', 'ided', 'gabor', 'prototype', 'analytics'],
  talent: ['quiz', 'qualitative', 'report', 'energy', 'mirror', 'theories'],
  plasticity: ['mindmap', 'simulator', 'protocols'],
};

const APPS = ONLY.length > 0 ? Object.fromEntries(Object.entries(TABLES).filter(([app]) => ONLY.includes(app))) : TABLES;

function tabSelector(app, tab) {
  if (app === 'neuro') return `#task-tab-${tab}`;
  if (app === 'plasticity') return `#tab-${tab}`;
  return `#tab-nav-${tab}`;
}

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;

  // 回退到 puppeteer / playwright 的浏览器缓存
  const roots = [
    path.join(os.homedir(), 'Library/Caches/ms-playwright'),
    path.join(os.homedir(), '.cache/ms-playwright'),
    path.join(os.homedir(), '.cache/puppeteer'),
  ];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const dir of fs.readdirSync(root)) {
      for (const rel of [
        'chrome-headless-shell-mac-arm64/chrome-headless-shell',
        'chrome-headless-shell-linux64/chrome-headless-shell',
        'chrome-linux64/chrome',
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      ]) {
        const p = path.join(root, dir, rel);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

/** 注入与真实落盘形状一致的数据，使结果页/表格真正渲染出来。 */
function seed(app, lang) {
  if (app === 'wm') {
    return {
      wm: JSON.stringify({
        schemaVersion: 2,
        lastNBackResult: {
          date: new Date().toISOString(), n: 2, mode: 'spatial', totalTrials: 20, hits: 5, misses: 1,
          falseAlarms: 2, correctRejections: 12, accuracy: 0.85, dPrime: 2.34, meanReactionTimeMs: 612,
        },
        lastOSPANResult: {
          date: new Date().toISOString(), absoluteScore: 5, totalScore: 9, maxPossibleScore: 14,
          mathAccuracy: 92, meanMathRT: 2400, sets: [],
        },
        lastChangeDetectionResult: {
          date: new Date().toISOString(), totalTrials: 24, overallAccuracy: 0.79, meanCowanK: 2.6,
          breakdownBySetSize: [
            { setSize: 4, trials: 8, hits: 6, misses: 2, falseAlarms: 1, correctRejections: 7, k: 2.5 },
          ],
        },
        history: [
          { id: 'nback_1', timestamp: Date.now(), type: 'nback', scoreDisplay: 'd′ 2.34', detail: 'accuracy 85%' },
          { id: 'ospan_1', timestamp: Date.now() - 86400000, type: 'ospan', scoreDisplay: 'span 5', detail: 'partial 9/14' },
        ],
      }),
    };
  }
  const wcst = (id, acc, pe) => ({
    id, timestamp: new Date().toISOString(), task: 'wcst', durationSeconds: 180, accuracy: acc,
    loadConfig: {
      timeLimitSeconds: 0, workingMemoryDistractor: false, perceptualNoiseLevel: 0,
      distractorInterference: false, presetName: 'baseline',
    },
    keyMetricName: 'Accuracy', keyMetricValue: `${acc}%`,
    // 关键：与 createSessionRecord 落盘一致，stats 嵌套在 metrics.<task> 之下
    metrics: {
      task: 'wcst',
      wcst: {
        totalTrials: 64, correctTrials: 50, accuracy: acc, categoriesCompleted: 3,
        perseverativeResponses: 8, perseverativeErrors: pe, perseverativeErrorRate: 9.4,
        nonPerseverativeErrors: 5, omissions: 2, omissionRate: 3.1, meanReactionTimeMs: 742,
        failuresToMaintainSet: 1, conceptLevelResponses: 12, trialsToFirstCategory: 14,
      },
    },
  });
  void lang;
  return { neuro: JSON.stringify([wcst('wcst_1', 78, 6), wcst('wcst_2', 71, 9)]) };
}

const chrome = findChrome();
if (!chrome) {
  console.error('未找到可用的 Chrome/Chromium。请设置 CHROME_PATH 环境变量。');
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});

let checked = 0;
const failures = [];

/**
 * 串行跑 80 个组合要 4 分多钟；这里用固定并发把总时长压到 1 分钟左右，
 * 每个组合仍是独立的 page，互不影响。
 */
const CONCURRENCY = Number(process.env.CHECK_CONCURRENCY || 4);

async function checkOne(app, tab, width, lang) {
  const page = await browser.newPage();
  const jsErrors = [];
  page.on('pageerror', (e) => jsErrors.push(String(e).slice(0, 140)));

  try {
    await page.setViewport({ width, height: 900 });
    await page.goto(`${BASE}/${app}/`, { waitUntil: 'networkidle2' });
    await page.evaluate(
      (l, seeds) => {
        localStorage.setItem('brian.lang', l);
        if (seeds.wm) localStorage.setItem('wm_cognitive_platform_data_v1', seeds.wm);
        if (seeds.neuro) sessionStorage.setItem('neuroclassify.sessions.v1', seeds.neuro);
      },
      lang,
      seed(app, lang)
    );
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 300));

    try {
      await page.click(tabSelector(app, tab));
    } catch {
      /* 窄屏下页签可能需横向滚动才可见，点不到就只检查当前视图 */
    }
    await new Promise((r) => setTimeout(r, 600));

    const result = await page.evaluate(() => {
      const de = document.documentElement;
      const vw = window.innerWidth;
      const offenders = [];
      if (de.scrollWidth > vw + 1) {
        const clipped = (el) => {
          let p = el.parentElement;
          while (p && p !== document.body) {
            const cs = getComputedStyle(p);
            if (['auto', 'scroll', 'hidden', 'clip'].includes(cs.overflowX)) return p;
            p = p.parentElement;
          }
          return null;
        };
        for (const el of document.querySelectorAll('body *')) {
          const b = el.getBoundingClientRect();
          if (b.right > vw + 1 && !clipped(el) && b.width < vw * 3) {
            offenders.push(
              `<${el.tagName.toLowerCase()} class="${(el.className || '').toString().slice(0, 70)}"> right=${Math.round(b.right)}`
            );
          }
        }
      }
      return {
        vw,
        scrollWidth: de.scrollWidth,
        crashed: /encountered a problem|遇到问题/.test(document.body.innerText),
        offenders: offenders.slice(0, 3),
      };
    });

    checked += 1;
    const overflow = result.scrollWidth - result.vw;
    const label = `${width}px [${lang}] ${app}/${tab}`;

    if (result.crashed) failures.push(`${label}: 页面进入错误边界（渲染异常）`);
    else if (overflow > 1) failures.push(`${label}: 横向溢出 ${overflow}px → ${result.offenders.join(' ; ')}`);
    else if (jsErrors.length > 0) failures.push(`${label}: JS 错误 ${jsErrors[0]}`);
  } finally {
    await page.close();
  }
}

// 展开成任务列表后按固定并发执行
const tasks = [];
for (const [app, tabs] of Object.entries(APPS)) {
  for (const width of WIDTHS) {
    for (const lang of LANGS) {
      for (const tab of tabs) tasks.push({ app, tab, width, lang });
    }
  }
}

let cursor = 0;
async function worker() {
  while (cursor < tasks.length) {
    const task = tasks[cursor];
    cursor += 1;
    await checkOne(task.app, task.tab, task.width, task.lang);
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, () => worker()));

await browser.close();

if (failures.length > 0) {
  console.error(`\n布局检查失败（${failures.length}/${checked}）：`);
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(`✓ 布局检查通过：${checked} 个「宽度 × 语言 × 页面」组合均无横向溢出、无渲染异常`);
