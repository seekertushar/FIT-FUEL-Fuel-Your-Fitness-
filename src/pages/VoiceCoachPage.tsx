import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, Zap, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useApp } from '../context/AppContext';
import { API_CONFIG, apiFetch } from '../services/apiConfig';
import { useLanguage } from '../context/LanguageContext';

interface TranscriptEntry {
  id: string;
  role: 'user' | 'coach';
  text: string;
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64Pcm24kToFloat32(base64: string): Float32Array {
  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const samples = new Float32Array(Math.floor(len / 2));
  for (let i = 0; i < samples.length; i++) {
    samples[i] = view.getInt16(i * 2, true) / 32768;
  }
  return samples;
}

export const VoiceCoachPage: React.FC = () => {
  const { user, addToast } = useApp();
  const { language, t, tx, localize } = useLanguage();

  // Live API Voice state
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [liveError, setLiveError] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // Text Deep Thinking / Fast Q&A state
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState<'deep' | 'fast'>('deep');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState('');
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string; model: string }>>([]);

  const stopPlaybackQueue = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    }
  };

  const playPcm24kChunk = (base64: string) => {
    const ctx = outputCtxRef.current;
    if (!ctx) return;
    const samples = base64Pcm24kToFloat32(base64);
    const buffer = ctx.createBuffer(1, samples.length, 24000);
    buffer.getChannelData(0).set(samples);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
    };
  };

  const disconnectLive = () => {
    try {
      processorRef.current?.disconnect();
      processorRef.current = null;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
      inputCtxRef.current?.close();
      inputCtxRef.current = null;
      stopPlaybackQueue();
      outputCtxRef.current?.close();
      outputCtxRef.current = null;
      wsRef.current?.close();
      wsRef.current = null;
    } catch {
      // ignore cleanup errors
    }
    setLiveStatus('idle');
  };

  useEffect(() => {
    return () => {
      disconnectLive();
    };
  }, []);

  const connectLive = async () => {
    setLiveError('');
    setLiveStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/live?lang=${language}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.ready) {
            setLiveStatus('connected');
            addToast('success', tx('Live Voice Coach connected.', 'लाइव वॉइस कोच कनेक्ट हो गया।'));
          }
          if (msg.audio) {
            playPcm24kChunk(msg.audio);
          }
          if (msg.interrupted) {
            stopPlaybackQueue();
          }
          if (msg.inputTranscript) {
            setTranscripts((prev) => [
              ...prev,
              { id: `u-${Date.now()}-${Math.random()}`, role: 'user', text: msg.inputTranscript },
            ]);
          }
          if (msg.outputTranscript) {
            setTranscripts((prev) => [
              ...prev,
              { id: `c-${Date.now()}-${Math.random()}`, role: 'coach', text: msg.outputTranscript },
            ]);
          }
          if (msg.error) {
            setLiveError(msg.error);
            setLiveStatus('error');
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => {
        setLiveError(
          tx(
            'Unable to reach Live Voice WebSocket server.',
            'लाइव वॉइस WebSocket सर्वर से कनेक्ट नहीं हो सका।'
          )
        );
        setLiveStatus('error');
      };

      ws.onclose = () => {
        setLiveStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
      };

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const base64 = float32ToPcm16Base64(e.inputBuffer.getChannelData(0));
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      setLiveError(
        err?.message ||
          tx('Microphone access was denied or unavailable.', 'माइक्रोफ़ोन की अनुमति अस्वीकृत या अनुपलब्ध है।')
      );
      setLiveStatus('error');
      disconnectLive();
    }
  };

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setQaError('');
    setQaLoading(true);
    const currentQ = question.trim();

    try {
      const res = await apiFetch<{ text: string; model: string }>(API_CONFIG.endpoints.geminiAsk, {
        method: 'POST',
        body: JSON.stringify({
          question: currentQ,
          mode,
          language,
          userContext: {
            age: user.age,
            fitnessGoal: user.fitnessGoal,
            dietaryPreference: user.dietaryPreference,
            experience: user.experience,
            allergies: user.allergies,
          },
        }),
      });
      setQaHistory((prev) => [{ q: currentQ, a: res.text, model: res.model }, ...prev]);
      setQuestion('');
    } catch (err: any) {
      setQaError(
        err?.message ||
          tx('Could not get a response right now.', 'इस समय उत्तर प्राप्त नहीं हो सका।')
      );
    } finally {
      setQaLoading(false);
    }
  };

  const samplePrompts =
    language === 'hi'
      ? [
          'सुबह के वर्कआउट के बाद शाकाहारी भारतीय नाश्ते के 3 विकल्प बताएँ',
          'शुरुआती लोगों के लिए घुटने की सुरक्षा के साथ स्क्वाट फॉर्म टिप्स',
          'गर्मी के मौसम में जिम के बाद हाइड्रेशन के लिए क्या पिएँ?',
        ]
      : [
          'Suggest 3 quick Indian vegetarian post-workout breakfasts using home ingredients',
          'How do I pace a Beginner 30-minute incline treadmill walk safely?',
          'How can I balance protein across dal, curd, paneer, and sprouts in one day?',
        ];

  return (
    <DashboardLayout
      title={t('sidebarVoiceCoach')}
      subtitle={tx(
        'Optional real-time Live Voice conversations and deep-thinking Indian fitness Q&A. Core BMI, diet, and workout modules remain 100% rule-based.',
        'वैकल्पिक रीयल-टाइम वॉइस कोचिंग और गहन फिटनेस प्रश्नोत्तर। कोर BMI, डाइट और वर्कआउट प्लान पूरी तरह नियम-आधारित रहते हैं।'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Live Voice Session Card */}
        <div className="lg:col-span-5 rounded-2xl bg-[#15191C] text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#B6F23B]" />
              <span>{tx('Real-Time Voice Session', 'लाइव वॉइस सेशन')}</span>
            </h2>
            <span className="font-mono text-xs text-[#C5CEC7] capitalize">{localize(liveStatus)}</span>
          </div>

          <p className="mt-2 text-xs text-[#C5CEC7] leading-relaxed">
            {tx(
              'Speak naturally in English or Hindi for hands-free workout form cues and Indian meal swaps while training.',
              'अपने माइक्रोफ़ोन से हिंदी या अंग्रेज़ी में बोलें और तुरंत ऑडियो मार्गदर्शन सुनें (16kHz इनपुट / 24kHz ऑडियो आउटपुट)।'
            )}
          </p>

          {liveError && (
            <div className="mt-4 rounded-xl bg-rose-950/60 border border-rose-500/40 p-3 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{liveError}</span>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            {liveStatus === 'connected' || liveStatus === 'connecting' ? (
              <button
                type="button"
                onClick={disconnectLive}
                className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MicOff className="w-4 h-4" />
                <span>{tx('End Voice Session', 'सत्र समाप्त करें')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={connectLive}
                className="w-full py-3.5 px-4 rounded-xl bg-[#B6F23B] hover:bg-[#A4E028] text-[#15191C] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span>{tx('Start Live Voice Conversation', 'लाइव वॉइस शुरू करें')}</span>
              </button>
            )}
          </div>

          {/* Live Transcript Box */}
          <div className="mt-6 rounded-xl bg-white/5 border border-white/10 p-4 h-64 overflow-y-auto space-y-3">
            {transcripts.length === 0 ? (
              <p className="text-xs text-[#9BA59D]">
                {tx(
                  'Live conversation transcripts will appear here once you start talking.',
                  'वॉइस सेशन शुरू करने पर लाइव ट्रांसक्रिप्ट यहाँ दिखाई देगी।'
                )}
              </p>
            ) : (
              transcripts.map((tr) => (
                <div key={tr.id} className="text-xs leading-relaxed">
                  <span className="font-semibold text-[#B6F23B]">
                    {tr.role === 'user' ? tx('You: ', 'आप: ') : tx('Coach: ', 'कोच: ')}
                  </span>
                  <span className="text-[#E2E8DF]">{tr.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deep Thinking & Fast Q&A Panel */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#161B1E] border border-[#E2E8DF] dark:border-[#262F35] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold">
                {tx('Deep Thinking & Fast Fitness Q&A', 'गहन विचार व त्वरित फिटनेस प्रश्नोत्तर')}
              </h2>
              <p className="text-xs text-[#5B655D] dark:text-[#9BA59D]">
                {tx(
                  `Respects your profile language (${language.toUpperCase()}), diet (${user.dietaryPreference}), and age safety.`,
                  `आपकी प्रोफ़ाइल भाषा (${language === 'hi' ? 'हिंदी' : 'EN'}), आहार (${localize(user.dietaryPreference)}) और आयु सुरक्षा का पालन करता है।`
                )}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] self-start">
              <button
                type="button"
                onClick={() => setMode('deep')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  mode === 'deep'
                    ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]'
                    : 'text-[#5B655D] dark:text-[#9BA59D]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tx('High Thinking', 'गहन विचार')}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('fast')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  mode === 'fast'
                    ? 'bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C]'
                    : 'text-[#5B655D] dark:text-[#9BA59D]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{tx('Fast', 'त्वरित')}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQuestion(p)}
                className="text-left text-xs px-3 py-1.5 rounded-lg bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] text-[#5B655D] dark:text-[#C5CEC7] hover:text-[#15191C] dark:hover:text-white"
              >
                {p}
              </button>
            ))}
          </div>

          {qaError && (
            <div role="alert" className="mt-4 rounded-xl bg-[#FEE2E2] dark:bg-[#3A1618] p-3 text-xs text-[#B91C1C] dark:text-[#FCA5A5]">
              {qaError}
            </div>
          )}

          <form onSubmit={handleAskCoach} className="mt-4 flex gap-2.5">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={tx(
                'Ask about Indian meal balance, workout form, or recovery...',
                'भारतीय भोजन, स्ट्रेचिंग या वर्कआउट के बारे में पूछें...'
              )}
              aria-label={tx('Ask a fitness or nutrition question', 'फिटनेस या पोषण से जुड़ा प्रश्न पूछें')}
              className="flex-1 rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B6F23B]"
            />
            <button
              type="submit"
              disabled={qaLoading}
              className="px-5 py-2.5 rounded-xl bg-[#15191C] dark:bg-[#B6F23B] text-white dark:text-[#15191C] text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{qaLoading ? tx('Thinking...', 'सोच रहा है...') : tx('Ask', 'पूछें')}</span>
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {qaHistory.length === 0 ? (
              <div className="rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-6 text-center text-xs text-[#5B655D] dark:text-[#9BA59D]">
                {tx(
                  'Choose a prompt above or type a question to receive tailored Indian fitness guidance.',
                  'ऊपर दिया गया कोई प्रश्न चुनें या अपना प्रश्न लिखकर भारतीय फिटनेस मार्गदर्शन प्राप्त करें।'
                )}
              </div>
            ) : (
              qaHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[#F7F9F5] dark:bg-[#0E1113] border border-[#E2E8DF] dark:border-[#262F35] p-4"
                >
                  <p className="text-xs font-semibold text-[#15191C] dark:text-[#F3F6F2]">{item.q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#202820] dark:text-[#E2E8DF] whitespace-pre-line">
                    {item.a}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
