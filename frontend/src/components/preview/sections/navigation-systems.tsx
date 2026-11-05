import { Chapter } from "../chapter";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Swords, Trophy, Users, LayoutDashboard, CreditCard, FileText } from "lucide-react";

export function NavigationSystems() {
  return (
    <Chapter id="navigation-systems" title="Navigation Systems" subtitle="Public top-nav, admin sidebar, and breadcrumb trail — the three navigation shells the production site reuses across route groups.">
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Public top navigation</p>
          <div className="manga-panel flex items-center justify-between px-5 py-3">
            <span className="text-display font-semibold">UP &apos;N ROLL</span>
            <div className="hidden sm:flex items-center gap-5 text-sm text-muted-foreground">
              <span className="text-foreground">Events</span>
              <span>Fighters</span>
              <span>Rankings</span>
              <span>Media</span>
            </div>
            <Button size="sm">Register</Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Admin sidebar shell</p>
          <div className="manga-panel flex overflow-hidden h-56">
            <div className="w-48 bg-sidebar border-r border-black/10 p-3 space-y-1 text-sm">
              {[
                { icon: LayoutDashboard, label: "Overview" },
                { icon: Users, label: "Athletes" },
                { icon: CreditCard, label: "Payments", active: true },
                { icon: Swords, label: "Brackets" },
                { icon: Trophy, label: "Results" },
                { icon: FileText, label: "Content" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${item.active ? "bg-primary/15 text-brand-red-dark font-medium" : "text-muted-foreground"}`}
                >
                  <item.icon className="size-4" /> {item.label}
                </div>
              ))}
            </div>
            <div className="flex-1 p-4 text-sm text-muted-foreground">
              Content region — payment verification queue renders here (Chapter 17).
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Breadcrumb trail</p>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Events</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Underground Arena Vol. 4</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Brackets</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Fighter portal header</p>
          <div className="manga-panel flex items-center justify-between px-5 py-3">
            <span className="text-sm text-muted-foreground">Dashboard / Registrations</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">Rhea Kolhapure</span>
              <Avatar className="size-8"><AvatarFallback>RK</AvatarFallback></Avatar>
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
