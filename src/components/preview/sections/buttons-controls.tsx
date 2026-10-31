"use client";

import { useState } from "react";
import { Chapter, FixtureBadge } from "../chapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Search, UploadCloud, ShieldAlert, Trophy } from "lucide-react";

export function ButtonsControls() {
  const [loading, setLoading] = useState(false);

  return (
    <Chapter id="buttons-controls" title="Buttons and Controls" subtitle="Primitive states used throughout the fighter and admin portals.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Buttons</p>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
            <Button
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1500);
              }}
              disabled={loading}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Submitting…" : "Loading button"}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Text inputs</p>
          <Input placeholder="Display name" />
          <Input type="email" placeholder="fighter@example.com" />
          <Input type="number" placeholder="Weight (kg)" />
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search fighters…" className="pl-8" />
          </div>
          <Textarea placeholder="Review note…" />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Selection controls</p>
          <Select defaultValue="lw">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lw">Lightweight</SelectItem>
              <SelectItem value="ww">Welterweight</SelectItem>
              <SelectItem value="fw">Featherweight</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Checkbox id="agree" />
            <Label htmlFor="agree">I agree to the event rules</Label>
          </div>
          <RadioGroup defaultValue="mma">
            <div className="flex items-center gap-2"><RadioGroupItem value="mma" id="mma" /><Label htmlFor="mma">MMA</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="grappling" id="grappling" /><Label htmlFor="grappling">Grappling</Label></div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Tabs & status</p>
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="text-sm text-muted-foreground pt-2">1 upcoming match</TabsContent>
            <TabsContent value="past" className="text-sm text-muted-foreground pt-2">4 completed matches</TabsContent>
          </Tabs>
          <div className="flex gap-2">
            <Badge className="bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40"><span className="size-1.5 rounded-full bg-brand-cyan live-pulse mr-1.5" />Live</Badge>
            <Badge variant="secondary">Scheduled</Badge>
            <Badge variant="outline">Completed</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Avatar, file upload, tooltip</p>
          <div className="flex items-center gap-3">
            <Avatar><AvatarFallback>RK</AvatarFallback></Avatar>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="outline" size="sm">Hover me</Button></TooltipTrigger>
              <TooltipContent>Rank #1 — Lightweight</TooltipContent>
            </Tooltip>
          </div>
          <label className="flex items-center gap-2 border border-dashed border-white/20 rounded-md px-3 py-4 text-sm text-muted-foreground cursor-pointer hover:border-white/40">
            <UploadCloud className="size-4" /> Upload payment screenshot
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Modal, drawer, toast</p>
          <div className="flex gap-2 flex-wrap">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" size="sm">Open modal</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve payment?</DialogTitle>
                  <DialogDescription>This confirms the registration and cannot be silently reversed.</DialogDescription>
                </DialogHeader>
                <DialogFooter><Button>Confirm approval</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Drawer>
              <DrawerTrigger asChild><Button variant="outline" size="sm">Open drawer</Button></DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Match details</DrawerTitle>
                  <DrawerDescription>Round of 16 — Mat 2 — 7:40 PM</DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
            <Button variant="outline" size="sm" onClick={() => toast("Registration submitted.")}>Trigger toast</Button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mt-10">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Pagination</p>
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Empty state</p>
          <Empty className="border border-dashed border-white/15 rounded-md">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Trophy /></EmptyMedia>
              <EmptyTitle>No registrations yet</EmptyTitle>
              <EmptyDescription>Browse events to find your next fight.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Error state & skeleton</p>
          <div className="flex items-center gap-2 text-sm text-primary mb-3"><ShieldAlert className="size-4" /> Payment review failed to load.</div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <FixtureBadge>All interactions above are real local UI state — no backend calls</FixtureBadge>
    </Chapter>
  );
}
