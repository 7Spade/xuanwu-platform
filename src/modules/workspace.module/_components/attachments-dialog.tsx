"use client";
/**
 * AttachmentsDialog — manage a list of photo URLs for a task.
 * Wave 43: WBS Tree Engine attachments management.
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
import { useTranslation } from "@/shared/i18n";

interface AttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoURLs?: readonly string[];
  onSave: (photoURLs: string[]) => void;
}

export function AttachmentsDialog({
  open,
  onOpenChange,
  photoURLs,
  onSave,
}: AttachmentsDialogProps) {
  const t = useTranslation("zh-TW");
  const [urls, setUrls] = useState<string[]>(photoURLs ? [...photoURLs] : []);
  const [newUrl, setNewUrl] = useState("");

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setUrls(photoURLs ? [...photoURLs] : []);
      setNewUrl("");
    }
    onOpenChange(o);
  };

  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) return;
    setUrls((prev) => [...prev, trimmed]);
    setNewUrl("");
  };

  const removeUrl = (idx: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave(urls);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("tasks.attachments.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {urls.length > 0 && (
            <ul className="space-y-1">
              {urls.map((url, idx) => (
                <li key={idx} className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
                  {/* Safe preview: only http/https */}
                  <img
                    src={/^https?:\/\//i.test(url) ? url : ""}
                    alt={t("tasks.attachmentPreviewAlt")}
                    className="size-10 shrink-0 rounded-lg border object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="flex-1 truncate text-xs text-muted-foreground">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeUrl(idx)}
                    className="shrink-0 rounded-md p-1 hover:bg-destructive/10"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4 text-destructive/70" />
                  </button>
                </li>
              ))}
            </ul>
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
