// The sheet's status messages. The emoji + wording carry the meaning; colour backs it up.
export default function Status({ status }) {
  if (!status) return null
  return <div className={`status status-${status.tone}`}>{status.text}</div>
}
