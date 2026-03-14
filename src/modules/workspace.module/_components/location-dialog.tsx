"use client";
/**
 * LocationDialog — building / floor / room / description sub-dialog.
 * Wave 43: WBS Tree Engine location picker.
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
import { useTranslation } from "@/shared/i18n";

export interface LocationValue {
  building?: string;
  floor?: string;
  room?: string;
  description?: string;
}

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: LocationValue;
  onSave: (value: LocationValue) => void;
}

export function LocationDialog({ open, onOpenChange, value, onSave }: LocationDialogProps) {
  const t = useTranslation("zh-TW");
  const [building, setBuilding] = useState(value?.building ?? "");
  const [floor, setFloor] = useState(value?.floor ?? "");
  const [room, setRoom] = useState(value?.room ?? "");
  const [description, setDescription] = useState(value?.description ?? "");

  // Reset when opened with new value
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setBuilding(value?.building ?? "");
      setFloor(value?.floor ?? "");
      setRoom(value?.room ?? "");
      setDescription(value?.description ?? "");
    }
    onOpenChange(o);
  };

  const handleSave = () => {
    onSave({
      ...(building.trim() ? { building: building.trim() } : {}),
      ...(floor.trim() ? { floor: floor.trim() } : {}),
      ...(room.trim() ? { room: room.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("tasks.location.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="loc-building">{t("tasks.location.building")}</Label>
            <Input
              id="loc-building"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder={t("tasks.location.buildingPlaceholder")}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="loc-floor">{t("tasks.location.floor")}</Label>
            <Input
              id="loc-floor"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder={t("tasks.location.floorPlaceholder")}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="loc-room">{t("tasks.location.room")}</Label>
            <Input
              id="loc-room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder={t("tasks.location.roomPlaceholder")}
              className="rounded-xl"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="loc-desc">{t("tasks.location.description")}</Label>
            <Input
              id="loc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("tasks.location.descriptionPlaceholder")}
              className="rounded-xl"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
