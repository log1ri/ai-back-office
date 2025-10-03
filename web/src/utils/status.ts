// utils/status.ts
import type { ImageData } from "../pages/ocr-services/ImageLogPage";
import type { listRateItem } from "../types/api.types";

export type AcceptReject = "accept" | "reject";
export type LocalCheck = { regnum?: AcceptReject; province?: AcceptReject } | undefined;

// สถานะสุดท้ายของรูป
export type FinalStatus = "verified" | "modified" | undefined;

/**
 * ตัดสินสถานะสุดท้ายของรูป
 * กติกา:
 * - API มีเสียงดังที่สุด (ถ้ามีค่าแล้วใช้เลย)
 * - ถ้าไม่มี API แต่มี optimistic (pending local ที่เพิ่งส่ง) → ใช้ optimistic
 * - ถ้าไม่มีทั้งคู่ → ใช้ local:
 *    - ถ้ามี reject อย่างน้อยหนึ่ง → modified
 *    - ถ้า accept ครบทั้ง 2 field → verified
 *    - ถ้ายังไม่ครบ → undefined
 */
export function resolveFinalStatus(
  local: LocalCheck,
  apiStatus?: AcceptReject,
  optimistic?: AcceptReject
): FinalStatus {
  const s = apiStatus ?? optimistic;
  if (s) {
    return s === "accept" ? "verified" : "modified";
  }

  if (!local) return undefined;

  const values = [local.regnum, local.province].filter(
    (v): v is AcceptReject => !!v
  );

  if (values.length === 0) return undefined;
  if (values.includes("reject")) return "modified";
  if (values.length === 2 && values.every((v) => v === "accept")) {
    return "verified";
  }
  return undefined; // ยังไม่ครบ หรือยังไม่ได้กด
}

/**
 * Normalize ค่า status จาก backend → ให้เหลือ accept / reject เท่านั้น
 */
export function normalizeApiStatus(s: unknown): AcceptReject | undefined {
  if (s == null) return undefined;
  const t = String(s).trim().toLowerCase();
  if (["accept", "accepted", "ok", "true", "1", "pass", "verified"].includes(t)) {
    return "accept";
  }
  if (["reject", "rejected", "false", "0", "fail", "modified"].includes(t)) {
    return "reject";
  }
  return undefined;
}

/**
 * หาค่า rating จาก apiMap โดยใช้ image.id (ต้องตรงกับ logId ของ backend)
 */
export function getRatingForImage(
  img: ImageData,
  apiMap: Record<string, listRateItem>
): listRateItem | undefined {
  return apiMap[img.id] || undefined;
}
