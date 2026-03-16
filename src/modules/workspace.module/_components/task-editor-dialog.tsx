"use client";
/**
 * TaskEditorDialog — full task form for WBS tree nodes.
 * Wave 43: covers name, type, priority, quantity, unitPrice, discount,
 *          location display, progress state.
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/design-system/primitives/ui/dialog";
import { Button } from "@/design-system/primitives/ui/button";
import { Input } from "@/design-system/primitives/ui/input";
import { Label } from "@/design-system/primitives/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/primitives/ui/select";
import { MapPin } from "lucide-react";
import { useTranslation } from "@/shared/i18n";
import { updateWorkItem } from "@/modules/work.module";
import { FirestoreWorkItemRepository } from "@/modules/work.module/infra.firestore/_repository";
import type { WorkItemDTO } from "@/modules/work.module";
import { LocationDialog } from "./location-dialog";
import type { LocationValue } from "./location-dialog";

let _repo: FirestoreWorkItemRepository | null = null;
function getRepo() {
  if (!_repo) _repo = new FirestoreWorkItemRepository();
  return _repo;
}

const TASK_TYPES = ["general", "supply", "labour", "equipment", "subcontract", "other"];
const PRIORITIES = ["low", "medium", "high", "critical"] as const;

interface TaskEditorDialogProps {
  item: WorkItemDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function TaskEditorDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
}: TaskEditorDialogProps) {
  const t = useTranslation("zh-TW");

  const [title, setTitle] = useState(item.title);
  const [type, setType] = useState(item.type ?? "general");
  const [priority, setPriority] = useState(item.priority);
  const [quantity, setQuantity] = useState(String(item.quantity ?? ""));
  const [unitPrice, setUnitPrice] = useState(String(item.unitPrice ?? ""));
  const [discount, setDiscount] = useState(String(item.discount ?? ""));
  const [location, setLocation] = useState<LocationValue | undefined>(item.location);
  const [locationOpen, setLocationOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setTitle(item.title);
      setType(item.type ?? "general");
      setPriority(item.priority);
      setQuantity(String(item.quantity ?? ""));
      setUnitPrice(String(item.unitPrice ?? ""));
      setDiscount(String(item.discount ?? ""));
      setLocation(item.location);
      setError(null);
    }
    onOpenChange(o);
  };

  const computedSubtotal = (): number | undefined => {
    const q = parseFloat(quantity);
    const p = parseFloat(unitPrice);
    if (isNaN(q) || isNaN(p)) return undefined;
    const d = parseFloat(discount) || 0;
    return Math.max(0, q * p - d);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError(t("tasks.titleRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await updateWorkItem(getRepo(), item.id, {
        title: title.trim(),
        type: type || null,
        priority,
        quantity: quantity ? parseFloat(quantity) : null,
        unitPrice: unitPrice ? parseFloat(unitPrice) : null,
        discount: discount ? parseFloat(discount) : null,
        location: location && Object.keys(location).length > 0 ? location : null,
      });
      if (!result.ok) throw result.error;
      onUpdated();
      onOpenChange(false);
    } catch {
      setError(t("tasks.failedToSaveTask"));
    } finally {
      setSaving(false);
    }
  };

  const locationLabel = location
    ? [location.building, location.floor, location.room].filter(Boolean).join(" / ")
    : "";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{t("wbs.editDialog.title")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="grid gap-1.5">
              <Label htmlFor="te-title">{t("wbs.createDialog.titleLabel")}</Label>
              <Input
                id="te-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>

            {/* Type + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>{t("tasks.taskType")}</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((tt) => (
                      <SelectItem key={tt} value={tt}>
                        {t(`tasks.type.${tt}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>{t("wbs.editDialog.priorityLabel")}</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as WorkItemDTO["priority"])}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {t(`wbs.priority.${p}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="te-qty">{t("tasks.quantity")}</Label>
                <Input
                  id="te-qty"
                  type="number"
                  min={0}
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="te-price">{t("tasks.unitPrice")}</Label>
                <Input
                  id="te-price"
                  type="number"
                  min={0}
                  step="any"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="te-disc">{t("tasks.discount")}</Label>
                <Input
                  id="te-disc"
                  type="number"
                  min={0}
                  step="any"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Subtotal preview */}
            {computedSubtotal() !== undefined && (
              <p className="text-right text-xs text-muted-foreground">
                {t("tasks.subtotal")}: <span className="font-semibold">{computedSubtotal()?.toFixed(2)}</span>
              </p>
            )}

            {/* Location */}
            <div className="grid gap-1.5">
              <Label>{t("tasks.location.title")}</Label>
              <Button
                type="button"
                variant="outline"
                className="h-9 justify-start rounded-xl text-xs"
                onClick={() => setLocationOpen(true)}
              >
                <MapPin className="mr-2 size-3.5 shrink-0 text-muted-foreground" />
                <span className={locationLabel ? "" : "text-muted-foreground"}>
                  {locationLabel || t("tasks.location.select")}
                </span>
              </Button>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("common.saving") : t("wbs.editDialog.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LocationDialog
        open={locationOpen}
        onOpenChange={setLocationOpen}
        value={location}
        onSave={setLocation}
      />
    </>
  );
}
