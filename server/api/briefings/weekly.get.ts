// GET /api/briefings/weekly
// Returns a self-contained, print-ready HTML document summarizing the week:
// - cash position (revenue / expense / profit)
// - top wins and risks (one per agent if available)
// - decisions taken in the boardroom
// - pending night-shift actions awaiting approval
//
// The user "prints to PDF" from the browser. No PDF lib dependency on purpose:
// keeps the demo dependency-free and rendering identical across machines.

import prisma from '../../utils/prisma';
import { getBusinessSnapshot } from '../../utils/businessContext';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const fmtMoney = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', 'text/html; charset=utf-8');

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [snapshot, sessions, events] = await Promise.all([
    getBusinessSnapshot(),
    prisma.boardroomSession.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.backgroundEvent.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ]);

  const week = {
    start: since.toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  };

  const briefByAgent: Record<string, string[]> = { cfo: [], cmo: [], operator: [] };
  const actionsPending = events.filter((e) => e.eventType === 'action' && e.status === 'pending');
  const actionsApproved = events.filter((e) => e.eventType === 'action' && (e.status === 'approved' || e.status === 'executed'));
  for (const ev of events) {
    if (ev.eventType === 'brief') {
      (briefByAgent[ev.agent] ??= []).push(ev.topic);
    }
  }

  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>الموجز الأسبوعي · AI Co-Founder</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Tahoma", sans-serif;
    margin: 0; padding: 24px; color: #1c1d22; background: #fff;
    line-height: 1.5;
  }
  h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -.02em; }
  h2 { font-size: 18px; margin: 24px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #1c1d22; }
  .meta { font-size: 12px; color: #72767f; margin-bottom: 24px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
  .kpi {
    border: 1px solid #d1d5db; border-radius: 12px; padding: 14px;
  }
  .kpi .label { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: #72767f; margin-bottom: 6px; }
  .kpi .value { font-size: 22px; font-weight: 800; }
  .kpi.positive .value { color: #059669; }
  .kpi.negative .value { color: #dc2626; }
  ul { margin: 6px 0 0; padding-inline-start: 1.2em; }
  li { margin-bottom: 4px; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: right; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: #72767f; }
  .row-agent {
    display: grid; grid-template-columns: 120px 1fr; gap: 12px;
    border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; margin-bottom: 8px;
  }
  .row-agent .name { font-weight: 800; }
  .pill {
    display: inline-block; font-size: 10px; padding: 2px 8px;
    border-radius: 999px; background: #f1f5f9; color: #1c1d22;
    text-transform: uppercase; letter-spacing: .08em; margin-inline-end: 6px;
  }
  .footer { margin-top: 32px; font-size: 11px; color: #72767f; text-align: center; border-top: 1px dashed #d1d5db; padding-top: 12px; }
  .print-btn {
    position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
    background: #1c1d22; color: white; border: 0; border-radius: 999px;
    padding: 10px 22px; font-weight: 700; cursor: pointer;
  }
  @media print {
    .print-btn { display: none; }
    body { padding: 0; }
  }
</style>
</head>
<body>
  <h1>الموجز الأسبوعي للأعمال</h1>
  <div class="meta">${escapeHtml(week.start)} — ${escapeHtml(week.end)} · صادر عن مجلس AI Co-Founder</div>

  <h2>الموقف المالي</h2>
  <div class="kpis">
    <div class="kpi positive">
      <div class="label">الإيرادات (30 يوم)</div>
      <div class="value">${escapeHtml(fmtMoney(snapshot.totals.revenue30d))}</div>
    </div>
    <div class="kpi negative">
      <div class="label">المصاريف (30 يوم)</div>
      <div class="value">${escapeHtml(fmtMoney(snapshot.totals.expense30d))}</div>
    </div>
    <div class="kpi ${snapshot.totals.profit30d >= 0 ? 'positive' : 'negative'}">
      <div class="label">الربح الصافي</div>
      <div class="value">${escapeHtml(fmtMoney(snapshot.totals.profit30d))}</div>
    </div>
    <div class="kpi">
      <div class="label">هامش الربح</div>
      <div class="value">${(snapshot.totals.profitMargin * 100).toFixed(1)}%</div>
    </div>
  </div>

  <h2>أبرز ما لاحظه المجلس</h2>
  <div class="row-agent">
    <div><div class="name">المدير المالي</div><div class="pill">CFO</div></div>
    <div>${
      briefByAgent.cfo?.length
        ? `<ul>${briefByAgent.cfo.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
        : '<em>لا توجد ملاحظات هذا الأسبوع.</em>'
    }</div>
  </div>
  <div class="row-agent">
    <div><div class="name">مدير التسويق</div><div class="pill">CMO</div></div>
    <div>${
      briefByAgent.cmo?.length
        ? `<ul>${briefByAgent.cmo.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
        : '<em>لا توجد ملاحظات هذا الأسبوع.</em>'
    }</div>
  </div>
  <div class="row-agent">
    <div><div class="name">مدير العمليات</div><div class="pill">OPERATOR</div></div>
    <div>${
      briefByAgent.operator?.length
        ? `<ul>${briefByAgent.operator.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
        : '<em>لا توجد ملاحظات هذا الأسبوع.</em>'
    }</div>
  </div>

  <h2>القرارات في المجلس (${sessions.length})</h2>
  ${
    sessions.length
      ? `<table>
          <thead><tr><th>التاريخ</th><th>الموضوع</th><th>القرار</th></tr></thead>
          <tbody>
            ${sessions
              .map(
                (s) => `<tr>
                  <td>${escapeHtml(s.createdAt.toISOString().slice(0, 10))}</td>
                  <td>${escapeHtml(s.topic)}</td>
                  <td>${escapeHtml(s.outcomeSummary || s.userDecision || '—')}</td>
                </tr>`
              )
              .join('')}
          </tbody>
         </table>`
      : '<em>لم يُعقد المجلس هذا الأسبوع.</em>'
  }

  <h2>الإجراءات المنفذة (${actionsApproved.length})</h2>
  ${
    actionsApproved.length
      ? `<ul>${actionsApproved.map((a) => `<li>${escapeHtml(a.topic)}${a.actionTaken ? ` — ${escapeHtml(a.actionTaken)}` : ''}</li>`).join('')}</ul>`
      : '<em>لم تُنفذ إجراءات بعد.</em>'
  }

  <h2>إجراءات بانتظار موافقتك (${actionsPending.length})</h2>
  ${
    actionsPending.length
      ? `<ul>${actionsPending.map((a) => `<li>${escapeHtml(a.topic)}</li>`).join('')}</ul>`
      : '<em>لا يوجد.</em>'
  }

  <div class="footer">AI Co-Founder · الشريك الذي لا ينام · للطباعة: استخدم Ctrl/Cmd+P</div>

  <button class="print-btn" onclick="window.print()">طباعة / حفظ كـ PDF</button>
</body>
</html>`;

  return html;
});
