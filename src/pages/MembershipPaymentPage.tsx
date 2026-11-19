import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, CreditCard, Smartphone, Building2, Printer, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { MEMBERSHIP_PLANS } from '../data/sampleData';
import { calculateGstBreakdown, formatInr, validateIndianUpiId } from '../services/progressService';
import { PaymentRecord } from '../types/fitfuel';
import { useLanguage } from '../context/LanguageContext';

export const MembershipPaymentPage: React.FC = () => {
  const { user, payments, recordPayment } = useApp();
  const { language, t, tx, localize } = useLanguage();
  const [searchParams] = useSearchParams();

  const initialPlan =
    MEMBERSHIP_PLANS.find((p) => p.id === searchParams.get('plan'))?.id || 'quarterly-pro';

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const [method, setMethod] = useState<PaymentRecord['paymentMethod']>('UPI (GPay / PhonePe)');
  const [upiApp, setUpiApp] = useState<'Google Pay' | 'PhonePe' | 'Paytm'>('Google Pay');
  const [upiId, setUpiId] = useState('aarav.sharma@okaxis');
  const [cardLast4, setCardLast4] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<PaymentRecord | null>(null);

  const selectedPlan = useMemo(
    () => MEMBERSHIP_PLANS.find((p) => p.id === selectedPlanId) || MEMBERSHIP_PLANS[1],
    [selectedPlanId]
  );

  const billing = useMemo(
    () => calculateGstBreakdown(selectedPlan.priceInr),
    [selectedPlan.priceInr]
  );

  const selectedPlanLabel = language === 'hi' ? selectedPlan.nameHi : selectedPlan.name;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let refText = '';
    if (method === 'UPI (GPay / PhonePe)' || method === 'UPI ID') {
      if (!validateIndianUpiId(upiId)) {
        setError(
          tx(
            'Enter a valid Indian UPI ID (e.g., yourname@okaxis, yourname@ybl, yourname@paytm).',
            'कृपया वैध भारतीय UPI ID दर्ज करें (जैसे yourname@okaxis, yourname@ybl, yourname@paytm)।'
          )
        );
        return;
      }
      refText = method === 'UPI (GPay / PhonePe)' ? `${upiApp} · ${upiId.trim()}` : upiId.trim();
    } else if (method === 'RuPay / Debit Card') {
      if (!/^\d{4}$/.test(cardLast4.trim())) {
        setError(
          tx(
            'Enter the last 4 digits of your RuPay / Visa / Mastercard for this demo checkout.',
            'इस डेमो चेकआउट के लिए अपने RuPay / Visa / Mastercard के अंतिम 4 अंक दर्ज करें।'
          )
        );
        return;
      }
      refText = `RuPay/Card •••• ${cardLast4.trim()}`;
    } else {
      refText = `${bankName} NetBanking`;
    }

    setProcessing(true);
    await new Promise((r) => window.setTimeout(r, 450));

    const invoiceNumber = `FF-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const saved = await recordPayment({
      planName: selectedPlan.name,
      amountInr: billing.baseInr,
      gstInr: billing.gstInr,
      totalInr: billing.totalInr,
      paymentMethod: method,
      upiOrRef: refText,
      invoiceNumber,
    });
    setLatestReceipt(saved);
    setProcessing(false);
  };

  return (
    <DashboardLayout
      title={t('sidebarMembership')}
      subtitle={tx(
        'Manage your Indian gym membership in ₹ INR with UPI, RuPay Card, or NetBanking checkout and instant 18% GST tax invoices.',
        'भारतीय ₹ INR जिम मेंबरशिप प्लान चुनें और UPI (GPay, PhonePe, Paytm), RuPay कार्ड या नेटबैंकिंग से 18% GST रसीद के साथ भुगतान करें।'
      )}
    >
      {/* Active Plan Banner */}
      <div className="mb-6 rounded-2xl bg-[#15191C] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#B6F23B]">
            {tx('Active Membership', 'सक्रिय मेंबरशिप')}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">{user.membershipPlan}</h2>
          <p className="mt-1 text-xs text-[#C5CEC7]">
            {tx('Branch:', 'शाखा:')} {user.branchCity} · {tx('GSTIN (Demo):', 'GSTIN (डेमो):')} 29AABCF1234K1Z5
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold whitespace-nowrap self-start sm:self-center no-print"
        >
          <Printer className="w-4 h-4" />
          <span>{tx('Print GST Receipt', 'GST रसीद प्रिंट करें')}</span>
        </button>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 no-print">
        {MEMBERSHIP_PLANS.map((plan) => {
          const active = selectedPlanId === plan.id;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={`text-left rounded-2xl p-6 border transition-colors ${
                active
                  ? 'bg-white dark:bg-[#161B1E] border-[#15191C] dark:border-[#B6F23B] ring-2 ring-[#B6F23B]'
                  : 'bg-white dark:bg-[#161B1E] border-[#E2E8DF] dark:border-[#262F35] hover:border-[#15191C]/40'
              }`}
            >
              <p className="text-xs font-semibold text-[#15803D] dark:text-[#B6F23B]">
                {language === 'hi' ? plan.audienceHi : plan.audience}
              </p>
              <h3 className="mt-1.5 font-display text-xl font-bold text-[#15191C] dark:text-[#F3F6F2]">
                {language === 'hi' ? plan.nameHi : plan.name}
              </h3>
              <p className="mt-3 font-mono text-3xl font-bold tabular-nums text-[#15191C] dark:text-[#F3F6F2]">
                {formatInr(plan.priceInr)}
              </p>
              <p className="mt-0.5 text-xs text-[#5B655D] dark:text-[#9BA59D]">
                {language === 'hi' ? plan.billingLabelHi : plan.billingLabel}
              </p>
              <ul className="mt-4 space-y-2 text-xs text-[#5B655D] dark:text-[#C5CEC7]">
                {(language === 'hi' ? plan.featuresHi : plan.features).slice(0, 3).map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 mt-0.5 text-[#15803D] dark:text-[#B6F23B] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Checkout Panel + Tax Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 no-print">
          <h3 className="font-display text-lg font-bold">
            {tx('Indian Payment Checkout (Simulated Gateway)', 'स्थानीय भारतीय भुगतान चेकआउट (डेमो गेटवे)')}
          </h3>
          <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D]">
            {tx(
              'Demonstration checkout flow structured for Razorpay / Cashfree UPI integration. No real bank charge is made.',
              'Razorpay / Cashfree UPI एकीकरण के लिए संरचित डेमो चेकआउट प्रवाह। कोई वास्तविक बैंक शुल्क नहीं काटा जाता।'
            )}
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(
              [
                { id: 'UPI (GPay / PhonePe)', icon: Smartphone, label: tx('UPI Apps', 'UPI ऐप्स') },
                { id: 'RuPay / Debit Card', icon: CreditCard, label: tx('RuPay / Card', 'RuPay / कार्ड') },
                { id: 'NetBanking (HDFC / SBI / ICICI)', icon: Building2, label: tx('NetBanking', 'नेटबैंकिंग') },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMethod(opt.id)}
                  className={`py-3 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    method === opt.id
                      ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] border-transparent'
                      : 'bg-[#F7F9F5] dark:bg-[#0E1113] border-[#E2E8DF] dark:border-[#262F35]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <div role="alert" className="mt-4 rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] p-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
              {error}
            </div>
          )}

          <form onSubmit={handlePay} className="mt-5 space-y-4">
            {method === 'UPI (GPay / PhonePe)' && (
              <>
                <div className="flex flex-wrap gap-2">
                  {(['Google Pay', 'PhonePe', 'Paytm'] as const).map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiApp(app)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border ${
                        upiApp === app
                          ? 'bg-[#B6F23B] text-[#15191C] border-[#B6F23B]'
                          : 'bg-[#F7F9F5] dark:bg-[#0E1113] border-[#E2E8DF] dark:border-[#262F35]'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
                <div>
                  <label htmlFor="upi-id" className="block text-xs font-semibold mb-1.5">
                    {tx('Enter UPI ID (VPA)', 'UPI ID (VPA) दर्ज करें')}
                  </label>
                  <input
                    id="upi-id"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@okaxis or 9845012345@ybl"
                    className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                  />
                </div>
              </>
            )}

            {method === 'RuPay / Debit Card' && (
              <div>
                <label htmlFor="card-last4" className="block text-xs font-semibold mb-1.5">
                  {tx(
                    'Demo RuPay / Visa Last 4 Digits (Do not enter real card numbers)',
                    'डेमो RuPay / Visa अंतिम 4 अंक (वास्तविक कार्ड नंबर दर्ज न करें)'
                  )}
                </label>
                <input
                  id="card-last4"
                  type="text"
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="4242"
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
                />
              </div>
            )}

            {method === 'NetBanking (HDFC / SBI / ICICI)' && (
              <div>
                <label htmlFor="bank-select" className="block text-xs font-semibold mb-1.5">
                  {tx('Select Indian Bank', 'भारतीय बैंक चुनें')}
                </label>
                <select
                  id="bank-select"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 px-5 rounded-xl bg-[#B6F23B] text-[#15191C] text-sm font-bold hover:bg-[#A4E028] transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {processing
                  ? tx('Confirming Payment...', 'भुगतान की पुष्टि हो रही है...')
                  : tx(
                      `Confirm ${formatInr(billing.totalInr)} (${selectedPlanLabel})`,
                      `${formatInr(billing.totalInr)} की पुष्टि करें (${selectedPlanLabel})`
                    )}
              </span>
            </button>
          </form>
        </div>

        {/* GST Summary Box */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">
              {tx('GST Tax Summary (INR)', 'GST कर सारांश (INR)')}
            </h3>
            <p className="mt-1 text-xs text-[#5B655D] dark:text-[#9BA59D]">
              {tx(
                'SAC Code 999723 · Gym & Fitness Centre Services',
                'SAC कोड 999723 · जिम और फिटनेस सेंटर सेवाएँ'
              )}
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[#5B655D] dark:text-[#9BA59D]">
                  {selectedPlanLabel} · {tx('Base Fee', 'मूल शुल्क')}
                </dt>
                <dd className="font-mono font-semibold tabular-nums">{formatInr(billing.baseInr)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#5B655D] dark:text-[#9BA59D]">CGST (9%) + SGST (9%)</dt>
                <dd className="font-mono font-semibold tabular-nums">{formatInr(billing.gstInr)}</dd>
              </div>
              <div className="pt-3 border-t border-[#E2E8DF] dark:border-[#262F35] flex items-center justify-between text-base font-bold">
                <dt>{tx('Total Payable', 'कुल देय राशि')}</dt>
                <dd className="font-mono text-[#15803D] dark:text-[#B6F23B] tabular-nums">
                  {formatInr(billing.totalInr)}
                </dd>
              </div>
            </dl>
          </div>

          {latestReceipt && (
            <div className="mt-6 rounded-xl bg-[#DCFCE7] dark:bg-[#143321] border border-[#15803D]/30 p-4 text-xs text-[#15803D] dark:text-[#86EFAC]">
              <p className="font-bold">
                {tx('Payment Recorded', 'भुगतान दर्ज किया गया')} · {latestReceipt.invoiceNumber}
              </p>
              <p className="mt-1">
                {latestReceipt.planName} ({formatInr(latestReceipt.totalInr)}) · {latestReceipt.upiOrRef}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GST Invoice History */}
      <div className="rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8DF] dark:border-[#262F35]">
          <h3 className="font-display text-base font-bold">
            {tx('Payment & GST Invoice History', 'भुगतान और GST चालान इतिहास')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E2E8DF] dark:border-[#262F35] bg-[#F7F9F5] dark:bg-[#0E1113] text-xs font-semibold text-[#5B655D] dark:text-[#9BA59D]">
                <th className="py-3 px-4">{tx('Invoice #', 'चालान #')}</th>
                <th className="py-3 px-4">{tx('Date', 'दिनांक')}</th>
                <th className="py-3 px-4">{tx('Plan', 'प्लान')}</th>
                <th className="py-3 px-4">{tx('Payment Method', 'भुगतान माध्यम')}</th>
                <th className="py-3 px-4 text-right">{tx('Base (₹)', 'मूल राशि (₹)')}</th>
                <th className="py-3 px-4 text-right">{tx('GST 18%', 'GST 18%')}</th>
                <th className="py-3 px-4 text-right">{tx('Total (₹)', 'कुल (₹)')}</th>
                <th className="py-3 px-4">{tx('Status', 'स्थिति')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8DF] dark:divide-[#262F35]">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-3 px-4 font-mono text-xs font-semibold">{p.invoiceNumber}</td>
                  <td className="py-3 px-4 font-mono text-xs">{p.paidAt}</td>
                  <td className="py-3 px-4 font-semibold">{p.planName}</td>
                  <td className="py-3 px-4 text-xs text-[#5B655D] dark:text-[#9BA59D]">{p.upiOrRef}</td>
                  <td className="py-3 px-4 font-mono text-right tabular-nums">{formatInr(p.amountInr)}</td>
                  <td className="py-3 px-4 font-mono text-right tabular-nums">{formatInr(p.gstInr)}</td>
                  <td className="py-3 px-4 font-mono text-right font-bold tabular-nums">{formatInr(p.totalInr)}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-[#15803D] dark:text-[#4ADE80]">
                    {localize(p.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
