import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Camera, Loader2, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/common/ResponsiveDialog";
import { UserAvatar } from "@/components/layout/AccountMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import {
  ACCEPTED_TYPES,
  MAX_SOURCE_BYTES,
  avatarSrc,
  cropToBase64,
  removeAvatar,
  uploadAvatar,
} from "@/lib/avatar";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/** Profile picture (T12): pick a photo, crop it round, save or remove it. */
export function AvatarCard() {
  const { data: session, refetch } = authClient.useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState<"save" | "remove" | null>(null);

  // Free the object URL of the previous photo.
  useEffect(() => () => void (source && URL.revokeObjectURL(source)), [source]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  if (!session) return null;
  const hasPhoto = !!avatarSrc(session.user.image);

  function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // choosing the same file again re-opens the cropper
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return void toast.error("Usa una imagen PNG, JPEG o WebP.");
    if (file.size > MAX_SOURCE_BYTES) return void toast.error("La imagen es muy grande (máximo 15 MB).");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setSource(URL.createObjectURL(file));
  }

  async function save() {
    if (!source || !area) return;
    setBusy("save");
    try {
      await uploadAvatar(await cropToBase64(source, area));
      await refetch();
      toast.success("Foto actualizada");
      setSource(null);
    } catch (err) {
      toast.error(err instanceof ApiError || err instanceof Error ? err.message : "No se pudo guardar la foto.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("remove");
    try {
      await removeAvatar();
      await refetch();
      toast.success("Foto eliminada");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo quitar la foto.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de perfil</CardTitle>
        <CardDescription>Solo tú la ves. Se recorta en círculo.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <UserAvatar name={session.user.name} image={session.user.image} className="size-16 text-base" />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => inputRef.current?.click()} disabled={busy !== null}>
            <Camera /> {hasPhoto ? "Cambiar foto" : "Subir foto"}
          </Button>
          {hasPhoto && (
            <Button variant="outline" onClick={remove} disabled={busy !== null}>
              {busy === "remove" ? <Loader2 className="animate-spin" /> : <Trash2 />} Quitar
            </Button>
          )}
        </div>
        <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(",")} className="hidden" onChange={pick} />
      </CardContent>

      <ResponsiveDialog
        open={source !== null}
        onOpenChange={(open) => !open && busy === null && setSource(null)}
        title="Ajusta tu foto"
        description="Arrastra para encuadrar y usa el zoom."
        footer={
          <Button onClick={save} disabled={busy !== null || !area} className="w-full sm:w-auto">
            {busy === "save" && <Loader2 className="animate-spin" />} Guardar foto
          </Button>
        }
      >
        {source && (
          <div className="space-y-4 pb-2">
            <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted sm:h-80">
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex items-center gap-3">
              <ZoomOut className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="range"
                aria-label="Zoom"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-primary"
              />
              <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </Card>
  );
}
