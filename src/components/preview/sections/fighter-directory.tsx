"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { previewFighters } from "@/lib/preview/fixtures";
import { Search } from "lucide-react";

export function FighterDirectory() {
  const [division, setDivision] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = previewFighters.filter(
    (f) =>
      (division === "all" || f.division === division) &&
      f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Chapter id="fighter-directory" title="Fighter Directory" subtitle="Card pattern adapted from UFC's athlete-directory structure (photo, name, division, record) — see research doc.">
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input placeholder="Search fighters…" className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={division} onValueChange={setDivision}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All divisions</SelectItem>
            <SelectItem value="Lightweight">Lightweight</SelectItem>
            <SelectItem value="Welterweight">Welterweight</SelectItem>
            <SelectItem value="Featherweight">Featherweight</SelectItem>
            <SelectItem value="Bantamweight">Bantamweight</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((f) => (
          <div key={f.id} className="manga-panel p-4 flex items-center gap-4">
            <Avatar className="size-14"><AvatarFallback>{f.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</AvatarFallback></Avatar>
            <div>
              <p className="font-semibold">{f.name}</p>
              <p className="text-xs text-muted-foreground">{f.division} · {f.discipline}</p>
              <Badge variant="outline" className="mt-1 text-xs">{f.record.w}-{f.record.l}-{f.record.d}</Badge>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No fighters match this filter.</p>}
      </div>
      <FixtureBadge>Filtering works locally against fictional fighter fixtures</FixtureBadge>
    </Chapter>
  );
}
