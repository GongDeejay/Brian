# i18n 约定（务必先读）

本目录是应用的中英文文案中心。**所有面向用户的文案都必须走词条**，不要在组件里硬编码中文。

## 目录结构

```
src/i18n/
├── index.tsx              内核：I18nProvider / useI18n / useT / translate
├── zh.ts                  中文聚合（MessageKey 的来源，唯一真源）
├── en.ts                  英文聚合（带完整性类型校验）
├── messages/
│   └── <模块>.ts          每个模块导出 { zh, en }
└── README.md
```

## 添加文案

在**你负责的模块文件**里同时写入两种语言：

```ts
export const nback = {
  zh: {
    'nback.title': 'N-back 任务训练与评估',
    'nback.progress': '第 {current} / {total} 试次',
  },
  en: {
    'nback.title': 'N-back Task Training & Assessment',
    'nback.progress': 'Trial {current} of {total}',
  },
} as const;
```

- 键名格式：`<模块>.<语义>`，小驼峰，避免歧义缩写。
- 占位符用 `{name}`，调用方 `t('nback.progress', { current: 3, total: 20 })`。
- **不要改 `zh.ts` / `en.ts`**：模块已全部注册好。若确实要新增模块，需同时改这两个文件。

## 在组件里使用

```tsx
import { useI18n } from '../i18n';

const { t, tList, lang } = useI18n();
// 或只要翻译函数时：
// import { useT } from '../i18n';  const t = useT();

<h1>{t('nback.title')}</h1>
<p>{t('nback.progress', { current: index + 1, total: total })}</p>
```

在**非组件**代码（service、util、导出器）里用：

```ts
import { translate, translateList } from '../i18n';
translate(lang, 'session.limit1');
```

数组型文案（如限制声明列表）请把键存成数组，渲染时用 `tList`：

```ts
tList(['session.limit1', 'session.limit2'])
```

## 漏译会被拦下

`en.ts` 里有 `export const en: Record<MessageKey, string> = enRaw;`。
只要有一个中文键没有对应的英文，**`tsc --noEmit` 就会报错并列出缺失键名**。
这是刻意的设计，不要为了让它通过而删掉英文键或改成 `as const`。

## 翻译质量要求（重要）

这不是普通的产品文案，**范式指导语翻译错误会让被试做错任务**。

1. **术语用文献通行译法**，不要直译：
   - 持续性错误 → *perseverative errors*（不是 "continuous errors"）
   - 定势转移 → *set shifting*；维度内/维度间 → *intra-/extra-dimensional*
   - 信息整合 → *information integration*；规则学习 → *rule-based learning*
   - 变化检测 → *change detection*；Cowans's K → *Cowan's K*
   - 复杂运算跨度 → *complex operation span (OSPAN)*
2. **按键与操作说明必须与代码行为一致**。翻完请回读一遍组件里真实的按键绑定（`onKeyDown` / 按钮文案），确保英文版说按下 X 就真的是 X。
3. **保留引用格式**（`Kirchner (1958)`、`Heaton (1993)` 等），不要翻译作者名或年份。
4. **数字、单位、指标缩写保持不变**（d′、K、RT、PE、NPE、CLR）。
5. 语气用学术但易懂的祈使句，与现有中文语气对应。

## 提交前自检

```bash
npx tsc --noEmit     # 必须 0 错误（会抓出漏译与类型问题）
npm run build        # 必须成功
```

另外请用 `grep -n "[一-龥]" <你改过的文件>` 确认**没有遗留硬编码中文**——
注释可以保留中文，但 JSX 文本、`title`、`aria-label`、`placeholder`、`alert`
以及传给 `setState` 的用户可见字符串都必须走词条。
