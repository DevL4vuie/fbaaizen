// Renders admin-authored text (tips, guidelines, prompts) as plain text only.
// Any URLs inside the text are visually flagged but never turned into
// clickable links or anchor tags — by design, users can't leave the
// platform via content links.
const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s]+)/gi

export default function LinkSafeText({ text = '' }) {
  // split() with a single capturing group returns matches at odd indices
  const parts = text.split(URL_PATTERN)
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-mono text-text-faint select-text">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}
