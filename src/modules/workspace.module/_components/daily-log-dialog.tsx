"use client";
/**
 * DailyLogDialog — create/edit dialog for daily log entries.
 * Wave 45.
 */

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/design-system/primitives/ui/textarea";
import { useTranslation } from "@/shared/i18n";
import { createDailyLog, updateDailyLog, type DailyLogDTO } from "@/modules/workspace.module";

interface DailyLogDialogProps {
  workspaceId: string;
  authorId: string;
  existingLog?: DailyLogDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function DailyLogDialog({
  workspaceId,
  authorId,
  existingLog,
  open,
  onOpenChange,
  onSaved,
}: DailyLogDialogProps) {
  const t = useTranslation("zh-TW");
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(existingLog?.date ?? todayStr);
  const [content, setContent] = useState(existingLog?.content ?? "");
  const [photoURLs, setPhotoURLs] = useState<string[]>(
    existingLog?.photoURLs ? [...existingLog.photoURLs] : [],
  );
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setDate(existingLog?.date ?? todayStr);
      setContent(existingLog?.content ?? "");
      setPhotoURLs(existingLog?.photoURLs ? [...existingLog.photoURLs] : []);
      setNewUrl("");
      setError(null);
    }
    onOpenChange(o);
  };

  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) return;
    setPhotoURLs((prev) => [...prev, trimmed]);
    setNewUrl("");
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError(t("workspace.daily.contentRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let result;
      if (existingLog) {
        result = await updateDailyLog(existingLog.id, content.trim(), photoURLs);
      } else {
        result = await createDailyLog(
          crypto.randomUUID(),
          workspaceId,
          date,
          content.trim(),
          photoURLs,
          authorId,
        );
      }
      if (!result.ok) throw result.error;
      onSaved();
      onOpenChange(false);
    } catch {
      setError(t("workspace.daily.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {existingLog ? t("workspace.daily.editEntry") : t("workspace.daily.addEntry")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date */}
          {!existingLog && (
            <div className="grid gap-1.5">
              <Label htmlFor="dl-date">{t("workspace.daily.date")}</Label>
              <Input
                id="dl-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="grid gap-1.5">
            <Label htmlFor="dl-content">{t("workspace.daily.content")}</Label>
            <Textarea
              id="dl-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("workspace.daily.contentPlaceholder")}
              className="resize-none rounded-xl"
            />
          </div>

          {/* Photos */}
          <div className="grid gap-1.5">
            <Label>{t("workspace.daily.photos")}</Label>
            {photoURLs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoURLs.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={/^https?:\/\//i.test(url) ? url : ""}
                      alt=""
                      className="h-16 w-16 rounded-lg border object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoURLs((p) => p.filter((_, i) => i !== idx))}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="size-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={t("tasks.attachments.urlPlaceholder")}
                className="rounded-xl text-xs"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
              />
              <Button type="button" size="sm" variant="outline" onClick={addUrl} className="shrink-0">
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
