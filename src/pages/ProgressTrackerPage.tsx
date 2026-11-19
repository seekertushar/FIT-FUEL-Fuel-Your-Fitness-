import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Plus, Pencil, Trash2, Printer, X } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ChartRange,
  filterProgressByRange,
  sortProgressByDateDesc,
} from '../services/progressService';
import { ProgressRecord } from '../types/fitfuel';

export const ProgressTrackerPage: React.FC = () => {
  const { progressRecords, addProgress, updateProgress, deleteProgress } = useApp();
  const { t, tx } = useLanguage();

  const [chartRange, setChartRange] = useState<ChartRange>('monthly');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgressRecord | null>(null);

  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [armCm, setArmCm] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const sortedDesc = useMemo(() => sortProgressByDateDesc(progressRecords), [progressRecords]);

  const chartData = useMemo(
    () =>
      filterProgressByRange(progressRecords, chartRange).map((r) => ({
        date: r.recordDate.slice(5),
        fullDate: r.recordDate,
        weight: r.weightKg,
        waist: r.waistCm,
      })),
    [progressRecords, chartRange]
  );

  const resetForm = () => {
    setEditingId(null);
    setRecordDate(new Date().toISOString().slice(0, 10));
    setWeightKg('');
    setWaistCm('');
    setChestCm('');
    setArmCm('');
    setNotes('');
    setFormError('');
  };

  const startEdit = (record: ProgressRecord) => {
    setEditingId(record.id);
    setRecordDate(record.recordDate);
    setWeightKg(record.weightKg !== null ? String(record.weightKg) : '');
    setWaistCm(record.waistCm !== null ? String(record.waistCm) : '');
    setChestCm(record.chestCm !== null ? String(record.chestCm) : '');
    setArmCm(record.armCm !== null ? String(record.armCm) : '');
    setNotes(record.notes || '');
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!recordDate) {
      setFormError(tx('Please pick a valid date.', 'कृपया एक मान्य दिनांक चुनें।'));
      return;
    }
    const w = weightKg.trim() ? Number(weightKg) : null;
    const wa = waistCm.trim() ? Number(waistCm) : null;
    const ch = chestCm.trim() ? Number(chestCm) : null;
    const ar = armCm.trim() ? Number(armCm) : null;

    if (w !== null && (!Number.isFinite(w) || w < 20 || w > 300)) {
      setFormError(
        tx(
          'Enter a valid weight between 20 and 300 kg (or leave blank).',
          '20 से 300 किग्रा के बीच मान्य वज़न दर्ज करें (या खाली छोड़ें)।'
        )
      );
      return;
    }
    if (w === null && wa === null && ch === null && ar === null && !notes.trim()) {
      setFormError(
        tx(
          'Enter at least one measurement or a personal note.',
          'कम से कम एक माप या व्यक्तिगत नोट दर्ज करें।'
        )
      );
      return;
    }

    const payload = {
      recordDate,
      weightKg: w,
      waistCm: wa,
      chestCm: ch,
      armCm: ar,
      notes: notes.trim(),
    };

    if (editingId) {
      await updateProgress(editingId, payload);
    } else {
      await addProgress(payload);
    }
    resetForm();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteProgress(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <DashboardLayout
      title={t('sidebarProgress')}
      subtitle={tx(
        'Log periodic check-ins at your own pace. Every record automatically updates your Dashboard charts and summaries.',
        'वज़न, शरीर के माप और व्यक्तिगत नोट्स दर्ज करें। हर रिकॉर्ड आपके डैशबोर्ड चार्ट को तुरंत अपडेट करता है।'
      )}
      headerAction={
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E2E8DF] dark:border-[#262F35] bg-white dark:bg-[#161B1E] text-xs font-semibold hover:bg-[#F7F9F5] dark:hover:bg-[#1E252A] no-print"
        >
          <Printer className="w-4 h-4" />
          <span>{t('printReport')}</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Add / Edit Record Form */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 no-print">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              {editingId ? tx('Edit Progress Record', 'प्रगति रिकॉर्ड संपादित करें') : t('addRecord')}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-[#5B655D] hover:text-[#15191C] inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> {tx('Cancel Edit', 'संपादन रद्द करें')}
              </button>
            )}
          </div>

          {formError && (
            <div role="alert" className="mt-4 rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] p-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="pr-date" className="block text-xs font-semibold mb-1.5">
                  {tx('Record Date *', 'दिनांक *')}
                </label>
                <input
                  id="pr-date"
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
              </div>
              <div>
                <label htmlFor="pr-weight" className="block text-xs font-semibold mb-1.5">
                  {tx('Weight (kg, optional)', 'वज़न (किग्रा, वैकल्पिक)')}
                </label>
                <input
                  id="pr-weight"
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="72.5"
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="pr-waist" className="block text-xs font-semibold mb-1.5">
                  {tx('Waist (cm)', 'कमर (सेमी)')}
                </label>
                <input
                  id="pr-waist"
                  type="number"
                  step="0.5"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  placeholder="81"
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
              </div>
              <div>
                <label htmlFor="pr-chest" className="block text-xs font-semibold mb-1.5">
                  {tx('Chest (cm)', 'छाती (सेमी)')}
                </label>
                <input
                  id="pr-chest"
                  type="number"
                  step="0.5"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                  placeholder="99"
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
              </div>
              <div>
                <label htmlFor="pr-arm" className="block text-xs font-semibold mb-1.5">
                  {tx('Arm (cm)', 'बाँह (सेमी)')}
                </label>
                <input
                  id="pr-arm"
                  type="number"
                  step="0.1"
                  value={armCm}
                  onChange={(e) => setArmCm(e.target.value)}
                  placeholder="35"
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="pr-notes" className="block text-xs font-semibold mb-1.5">
                {tx('Personal Notes (Energy, Sleep, Wins)', 'व्यक्तिगत नोट्स (ऊर्जा, नींद, उपलब्धियाँ)')}
              </label>
              <textarea
                id="pr-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tx(
                  'e.g., Great morning workout at Indiranagar branch, slept 7.5 hours.',
                  'जैसे, सुबह इंदिरानगर शाखा में अच्छा वर्कआउट किया, 7.5 घंटे की नींद।'
                )}
                className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#B6F23B] text-[#15191C] text-sm font-bold hover:bg-[#A4E028] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? t('saveChanges') : t('addRecord')}</span>
            </button>
          </form>
        </div>

        {/* Recharts Progress Graph */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-lg font-bold">
                {tx('Weight & Measurement Trend', 'वज़न और माप रुझान')}
              </h2>
              <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                {tx(
                  'Focus on long-term consistency—natural day-to-day fluctuations are completely normal.',
                  'दीर्घकालिक नियमितता पर ध्यान दें—रोज़मर्रा का हल्का उतार-चढ़ाव बिल्कुल सामान्य है।'
                )}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35]">
              {(['weekly', 'monthly', 'yearly'] as ChartRange[]).map((rng) => (
                <button
                  key={rng}
                  type="button"
                  onClick={() => setChartRange(rng)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    chartRange === rng
                      ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]'
                      : 'text-[#5B655D] dark:text-[#9BA59D]'
                  }`}
                >
                  {t(rng)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8DF" opacity={0.45} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#777F78" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="#777F78" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#15191C',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    name={tx('Weight (kg)', 'वज़न (किग्रा)')}
                    stroke="#15803D"
                    strokeWidth={2.5}
                    isAnimationActive={false}
                    dot={{ r: 4, fill: '#B6F23B', stroke: '#15191C', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="waist"
                    name={tx('Waist (cm)', 'कमर (सेमी)')}
                    stroke="#0284C7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    isAnimationActive={false}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#5B655D]">
                {tx('Add your first progress check-in to plot your timeline.', 'ग्राफ़ देखने के लिए अपना पहला प्रगति रिकॉर्ड जोड़ें।')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8DF] dark:border-[#262F35] flex items-center justify-between">
          <h2 className="font-display text-base font-bold">
            {tx('Saved Progress History', 'पिछले प्रगति रिकॉर्ड्स')} ({sortedDesc.length})
          </h2>
        </div>

        {sortedDesc.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#5B655D] dark:text-[#9BA59D]">
            {tx(
              'No records logged yet. Use the form above to record your first check-in.',
              'अभी कोई रिकॉर्ड दर्ज नहीं है। पहला चेक-इन जोड़ने के लिए ऊपर दिए गए फ़ॉर्म का उपयोग करें।'
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8DF] dark:border-[#262F35] text-xs font-semibold text-[#5B655D] dark:text-[#9BA59D] bg-[#F7F9F5] dark:bg-[#0E1113]">
                  <th className="py-3 px-4">{tx('Date', 'दिनांक')}</th>
                  <th className="py-3 px-4 text-right">{tx('Weight (kg)', 'वज़न (किग्रा)')}</th>
                  <th className="py-3 px-4 text-right">{tx('Waist (cm)', 'कमर (सेमी)')}</th>
                  <th className="py-3 px-4 text-right">{tx('Chest (cm)', 'छाती (सेमी)')}</th>
                  <th className="py-3 px-4 text-right">{tx('Arm (cm)', 'बाँह (सेमी)')}</th>
                  <th className="py-3 px-4">{tx('Notes', 'नोट्स')}</th>
                  <th className="py-3 px-4 text-right no-print">{tx('Actions', 'कार्य')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8DF] dark:divide-[#262F35] text-sm">
                {sortedDesc.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F7F9F5]/70 dark:hover:bg-[#1E252A]/60">
                    <td className="py-3.5 px-4 font-mono text-xs whitespace-nowrap">{r.recordDate}</td>
                    <td className="py-3.5 px-4 font-mono text-right font-semibold tabular-nums">
                      {r.weightKg !== null ? r.weightKg.toFixed(1) : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                      {r.waistCm !== null ? r.waistCm : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                      {r.chestCm !== null ? r.chestCm : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                      {r.armCm !== null ? r.armCm : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#5B655D] dark:text-[#9BA59D] max-w-xs">
                      {r.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap no-print">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        aria-label={`Edit progress record from ${r.recordDate}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#5B655D] hover:text-[#15191C] dark:hover:text-white hover:bg-[#EFF3EC] dark:hover:bg-[#262F35] mr-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r)}
                        aria-label={`Delete progress record from ${r.recordDate}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-[#B91C1C] dark:text-[#FCA5A5] hover:bg-[#FEE2E2] dark:hover:bg-[#3A1618]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={tx('Delete Progress Record?', 'प्रगति रिकॉर्ड हटाएँ?')}
        description={tx(
          `Are you sure you want to remove the check-in from ${deleteTarget?.recordDate}? This will also update your Dashboard chart.`,
          `क्या आप वाकई ${deleteTarget?.recordDate} का चेक-इन हटाना चाहते हैं? इससे आपका डैशबोर्ड चार्ट भी अपडेट हो जाएगा।`
        )}
        confirmLabel={tx('Delete Record', 'रिकॉर्ड हटाएँ')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
};
