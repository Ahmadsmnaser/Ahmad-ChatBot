import React from 'react';

const PY_KEYWORDS = [
  'class','def','return','if','elif','else','for','while','in','is','not','and','or',
  'import','from','as','with','try','except','finally','raise','pass','lambda','yield',
  'self','True','False','None',
];

interface Token { type: string; val: string }

function highlightPython(code: string): Token[] {
  const parts: Token[] = [];
  let i = 0;
  while (i < code.length) {
    const c = code[i];
    if (c === '#') {
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      parts.push({ type: 'com', val: code.slice(i, stop) });
      i = stop; continue;
    }
    if (c === '"' || c === "'") {
      const q = c;
      const triple = code.slice(i, i + 3) === q + q + q;
      if (triple) {
        const end = code.indexOf(q + q + q, i + 3);
        const stop = end === -1 ? code.length : end + 3;
        parts.push({ type: 'str', val: code.slice(i, stop) });
        i = stop;
      } else {
        let j = i + 1;
        while (j < code.length && code[j] !== q) { if (code[j] === '\\') j++; j++; }
        parts.push({ type: 'str', val: code.slice(i, Math.min(j + 1, code.length)) });
        i = Math.min(j + 1, code.length);
      }
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < code.length && /[A-Za-z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (PY_KEYWORDS.includes(word)) parts.push({ type: 'kw', val: word });
      else if (/^[A-Z]/.test(word)) parts.push({ type: 'cls', val: word });
      else if (code[j] === '(') parts.push({ type: 'fn', val: word });
      else parts.push({ type: 'txt', val: word });
      i = j; continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i + 1;
      while (j < code.length && /[0-9.]/.test(code[j])) j++;
      parts.push({ type: 'num', val: code.slice(i, j) });
      i = j; continue;
    }
    parts.push({ type: 'txt', val: c });
    i++;
  }
  return parts;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = React.useState(false);
  const tokens = lang === 'python' ? highlightPython(code) : null;
  const onCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{lang || 'text'}</span>
        <button className="code-copy-btn" onClick={onCopy} aria-label="Copy code">
          {copied ? '✓ Copied' : '⧉ Copy'}
        </button>
      </div>
      <pre><code>
        {tokens
          ? tokens.map((t, i) =>
              t.type === 'txt'
                ? t.val
                : <span key={i} className={`tok-${t.type}`}>{t.val}</span>
            )
          : code}
      </code></pre>
    </div>
  );
}

function renderInline(text: string, keyPrefix = 'i'): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  const inlineRe = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)]+\))/g;
  let m;
  while ((m = inlineRe.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('`')) {
      out.push(<code key={`${keyPrefix}-c-${key++}`} className="inline">{t.slice(1, -1)}</code>);
    } else if (t.startsWith('**')) {
      out.push(<strong key={`${keyPrefix}-b-${key++}`}>{t.slice(2, -2)}</strong>);
    } else if (t.startsWith('*')) {
      out.push(<em key={`${keyPrefix}-e-${key++}`}>{t.slice(1, -1)}</em>);
    } else if (t.startsWith('[')) {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(t);
      if (lm) out.push(<a key={`${keyPrefix}-a-${key++}`} href={lm[2]} target="_blank" rel="noreferrer">{lm[1]}</a>);
    }
    last = inlineRe.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderMarkdown(src: string): React.ReactNode[] {
  const blocks: React.ReactNode[] = [];
  const lines = src.split('\n');
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      blocks.push(<CodeBlock key={`k${key++}`} lang={lang} code={buf.join('\n')} />);
      continue;
    }

    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const lvl = h[1].length;
      const Tag = (['h1','h2','h3','h4'] as const)[lvl - 1];
      blocks.push(<Tag key={`k${key++}`}>{renderInline(h[2], `k${key}`)}</Tag>);
      i++; continue;
    }

    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      blocks.push(<blockquote key={`k${key++}`}>{renderInline(buf.join(' '), `k${key}`)}</blockquote>);
      continue;
    }

    if (/^\|.+\|$/.test(line) && i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1])) {
      const header = line.slice(1, -1).split('|').map(s => s.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\|.+\|$/.test(lines[i])) {
        rows.push(lines[i].slice(1, -1).split('|').map(s => s.trim())); i++;
      }
      blocks.push(
        <table key={`k${key++}`}>
          <thead><tr>{header.map((c, j) => <th key={j}>{renderInline(c, `h${j}`)}</th>)}</tr></thead>
          <tbody>{rows.map((r, ri) => (
            <tr key={ri}>{r.map((c, ci) => <td key={ci}>{renderInline(c, `r${ri}c${ci}`)}</td>)}</tr>
          ))}</tbody>
        </table>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, '')); i++; }
      blocks.push(<ol key={`k${key++}`}>{items.map((it, j) => <li key={j}>{renderInline(it, `oi${j}`)}</li>)}</ol>);
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s/, '')); i++; }
      blocks.push(<ul key={`k${key++}`}>{items.map((it, j) => <li key={j}>{renderInline(it, `ui${j}`)}</li>)}</ul>);
      continue;
    }

    if (line.trim() === '') { i++; continue; }

    const buf = [line]; i++;
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|```|>\s?|[-*]\s|\d+\.\s|\|.+\|$)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    blocks.push(<p key={`k${key++}`}>{renderInline(buf.join(' '), `k${key}`)}</p>);
  }

  return blocks;
}
