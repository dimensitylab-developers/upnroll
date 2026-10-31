import { Chapter, FixtureBadge } from "../chapter";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Bell } from "lucide-react";

const notifications = [
  { icon: CheckCircle2, color: "text-brand-cyan", title: "Registration confirmed", body: "Your payment for Underground Arena Vol. 4 was approved.", time: "2m ago" },
  { icon: Clock, color: "text-brand-gold", title: "Payment under review", body: "We received your UTR and screenshot — an admin will review shortly.", time: "1h ago" },
  { icon: XCircle, color: "text-primary", title: "Payment rejected", body: "Your submitted UTR could not be matched. Please resubmit.", time: "3h ago" },
  { icon: Bell, color: "text-muted-foreground", title: "Bracket published", body: "The Welterweight bracket for Vol. 4 is now live.", time: "1d ago" },
];

export function Notifications() {
  return (
    <Chapter id="notifications" title="Notifications" subtitle="In-app notification list. Email delivery and exact templates are pending client sign-off (OD-009) — nothing here claims an email was actually sent.">
      <div className="max-w-xl space-y-3">
        {notifications.map((n) => (
          <div key={n.title} className="manga-panel p-4 flex items-start gap-3">
            <n.icon className={`size-5 shrink-0 mt-0.5 ${n.color}`} />
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <p className="font-medium">{n.title}</p>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6"><Badge variant="outline">In-app only in this preview — no email was sent</Badge></div>
      <FixtureBadge />
    </Chapter>
  );
}
