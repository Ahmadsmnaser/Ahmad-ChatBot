'use client';

import { useCallback, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { askAhmadPublic, AskAhmadMode, Citation, ReasoningSummary } from '@/lib/api';
import { renderMarkdown } from '@/lib/markdown';
import React from 'react';

const SUGGESTED_QUESTIONS: { label: string; question: string; mode: AskAhmadMode }[] = [
  { label: 'Who is Ahmad Naser?', question: 'Who is Ahmad Naser?', mode: 'portfolio' },
  { label: "Ahmad's strongest projects", question: "What are Ahmad's strongest projects?", mode: 'portfolio' },
  { label: 'Fit for backend roles?', question: 'Is Ahmad a good fit for backend roles?', mode: 'recruiter' },
  { label: 'Fit for systems/low-level?', question: 'Is Ahmad a good fit for systems or low-level engineering roles?', mode: 'recruiter' },
  { label: 'Explain best projects', question: "Explain Ahmad's best projects in detail.", mode: 'portfolio' },
  { label: 'Match to job description', question: 'Compare Ahmad to this job description.', mode: 'job_match' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  reasoning?: ReasoningSummary;
}

export function AskAhmadPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AskAhmadMode>('portfolio');
  const [jobDescription, setJobDescription] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

  const send = useCallback(
    (question: string) => {
      if (!question.trim() || streaming) return;
      setError(null);

      const userMsg: Message = { role: 'user', content: question.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setStreaming(true);

      const assistantIdx = messages.length + 1;
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      scrollToBottom();

      const controller = new AbortController();
      abortRef.current = controller;

      askAhmadPublic(
        {
          question: question.trim(),
          mode,
          job_description: mode === 'job_match' && jobDescription.trim() ? jobDescription.trim() : undefined,
        },
        controller.signal,
        (token) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIdx] = {
              ...updated[assistantIdx],
              content: updated[assistantIdx].content + token,
            };
            return updated;
          });
        },
        (metadata) => {
          setStreaming(false);
          if (metadata?.citations || metadata?.reasoning_summary) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[assistantIdx] = {
                ...updated[assistantIdx],
                citations: metadata.citations,
                reasoning: metadata.reasoning_summary,
              };
              return updated;
            });
          }
          scrollToBottom();
        },
        (err) => {
          setStreaming(false);
          setError(err);
        },
      );
    },
    [streaming, messages.length, mode, jobDescription],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const handleSuggest = (q: { question: string; mode: AskAhmadMode }) => {
    setMode(q.mode);
    send(q.question);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto px-4 py-8 gap-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Ask Ahmad&apos;s Bot</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ask anything about Ahmad Naser&apos;s background, projects, and skills.
          Answers are grounded in verified profile data only.
        </p>
        <button
          onClick={() => signIn('google')}
          className="mt-2 text-xs underline text-blue-500 hover:text-blue-600"
        >
          Sign in for private chat &amp; file uploads →
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {(['portfolio', 'recruiter', 'job_match'] as AskAhmadMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              mode === m
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-transparent text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {m === 'portfolio' ? 'Portfolio' : m === 'recruiter' ? 'Recruiter' : 'Job Match'}
          </button>
        ))}
      </div>

      {/* Job description field (only in job_match mode) */}
      {mode === 'job_match' && (
        <textarea
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Paste a job description here for Ahmad to be evaluated against…"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      )}

      {/* Suggested questions (show only if no messages yet) */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED_QUESTIONS.map((sq) => (
            <button
              key={sq.label}
              onClick={() => handleSuggest(sq)}
              disabled={streaming}
              className="px-3 py-1.5 rounded-lg text-xs border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-400 transition-colors disabled:opacity-50"
            >
              {sq.label}
            </button>
          ))}
        </div>
      )}

      {/* Message thread */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[50vh] pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                  A
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {renderMarkdown(msg.content || '…')}
                  </div>
                ) : (
                  msg.content
                )}

                {/* Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600 space-y-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Sources
                    </p>
                    {Array.from(new Set(msg.citations.map((c) => c.fileName))).map((file) => (
                      <span
                        key={file}
                        className="inline-block mr-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs"
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                )}

                {/* Confidence badge */}
                {msg.reasoning && (
                  <div className="mt-2 flex items-center gap-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        msg.reasoning.confidence === 'high'
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : msg.reasoning.confidence === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                      }`}
                    >
                      {msg.reasoning.confidence} confidence
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
        <input
          type="text"
          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask something about Ahmad…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={streaming}
        />
        {streaming ? (
          <button
            type="button"
            onClick={handleStop}
            className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ask
          </button>
        )}
      </form>
    </div>
  );
}
