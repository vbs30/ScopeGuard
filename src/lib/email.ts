// Provider-neutral email module. Uses Resend's HTTP API when configured; otherwise dev mode (prints, does NOT send).
export type MailResult = "sent" | "logged" | "failed";
type Mail = { to: string; subject: string; text: string };

export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function sendEmail(m: Mail): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY, from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.log(`\n[email DEV MODE - NOT SENT]\nTo: ${m.to}\nSubject: ${m.subject}\n\n${m.text}\n`);
    return "logged";
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [m.to], subject: oneLine(m.subject), text: m.text }),
    });
    if (!r.ok) console.error("[email] provider rejected:", r.status);
    return r.ok ? "sent" : "failed";
  } catch (e) { console.error("[email] request failed"); return "failed"; }
}

export const describeMail = (r: MailResult) =>
  r === "sent" ? "Email sent to your client."
  : r === "logged" ? "Email NOT sent (email isn't configured; it was printed in the server terminal). Share the link yourself."
  : "Email could not be sent. Share the link yourself.";

export const mailScopePublished = (to: string, project: string, url: string): Mail => ({
  to, subject: `Scope of work for ${oneLine(project)}: please review`,
  text: `Hello,\n\nThe scope of work for "${project}" is ready for your review:\n\n${url}\n\nIt lists what is included, what is not, and the agreed timeline and price. Any extra work later will be sent to you as a change request for approval before it begins.\n\nSent via ScopeGuard.`,
});
export const mailChangeAwaiting = (to: string, project: string, title: string, cost: string, days: number, url: string): Mail => ({
  to, subject: `Approval needed: ${oneLine(title)} (${oneLine(project)})`,
  text: `Hello,\n\nA change request is waiting for your decision on "${project}":\n\n${title}\nAdditional cost: ${cost}\nAdditional time: ${days} day(s)\n\nReview and approve or decline here:\n${url}\n\nWork on this change starts only after you approve.\n\nSent via ScopeGuard.`,
});
export const mailDecisionToOwner = (to: string, project: string, client: string, title: string, status: string, comment: string | null, url: string): Mail => ({
  to, subject: `${client} ${status} "${oneLine(title)}"`,
  text: `${client} ${status} the change request "${title}" on "${project}".\n${comment ? `\nClient comment: ${comment}\n` : ""}\nView it: ${url}\n\nSent via ScopeGuard.`,
});