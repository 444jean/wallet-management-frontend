import type { Area } from "react-easy-crop";
import { api, json } from "@/lib/api";

/** Profile picture endpoint (T12). user.image only ever points here. */
export const AVATAR_PATH = "/api/me/avatar";
/** Side of the stored picture, in pixels (sharp on 3x screens at ~80px). */
const AVATAR_SIZE = 256;
/** Source photos above this are rejected before decoding them. */
export const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

/** Only the app's own avatar URL is rendered (never an arbitrary URL). */
export function avatarSrc(image: string | null | undefined): string | undefined {
  return image?.startsWith(`${AVATAR_PATH}?`) ? image : undefined;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo leer la imagen."));
    img.src = src;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Crops the selected area to a 256x256 WebP (JPEG where the browser cannot
 * encode WebP) and returns it as base64, ready for PUT /api/me/avatar.
 */
export async function cropToBase64(src: string, area: Area): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no permite recortar imágenes.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  let blob = await toBlob(canvas, "image/webp", 0.85);
  if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", 0.88);
  if (!blob) throw new Error("No se pudo procesar la imagen.");

  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export const uploadAvatar = (data: string) =>
  api<{ image: string }>("/me/avatar", { method: "PUT", body: json({ data }) });

export const removeAvatar = () => api("/me/avatar", { method: "DELETE" });
