import React, { useCallback, useState, useEffect } from "react";
import { ShadcnDatePicker } from "../../components/ui/DatePicker";
import { Search, Download, Check, X, SlidersHorizontal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useOcrLogs } from "../../hooks/useOcrLogs";
import { QueryLoadingWrapper } from "../../components/ui/loading-wrapper";
import { useSubIdContext } from "../../contexts/SubIdContext";
import { useAuthenticatedApi } from "../../hooks/useAuthenticatedApi";
import { useAuth } from "../../contexts/AuthContext";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import { rateModelService, ocrServicesRateModelService } from "../../services/index";
import type { listRateItem } from '../../types/api.types';
import { resolveFinalStatus, normalizeApiStatus, type FinalStatus } from "../../utils/status";
import 'antd/dist/reset.css';

// ฟังก์ชันสำหรับจัดรูปแบบวันที่
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  });
};

// Get Img Name from URL
function getFileNameFromUrl(url: string): string {
  if (!url) return "";
  const parts = url.split("/");
  const file = parts[parts.length - 1]?.split("?")[0] || "";
  return file.replace(/\.[^/.]+$/, "").trim(); // ตัดนามสกุลไฟล์ออก
}

// ==== NEW: types + util สำหรับสร้าง payload สะอาด ====
type FieldStatus = "accept" | "reject";
type RatingItem = {
  id: string;
  name: string;
  subId: string; 
  regnum: string; // เปลี่ยนจาก object เป็น string
  province: string; // เปลี่ยนจาก object เป็น string
  status: "accept" | "reject"; // เพิ่ม status field
};

// function Create payload for checkRateModel Api
function buildModifiedSummary(
  images: ImageData[],
  checkResults: Record<string, { regnum?: FieldStatus; province?: FieldStatus }>,
  correctionTexts: Record<string, { regnum?: string; province?: string }>,
): RatingItem[] {
  const mapById = new Map(images.map((i) => [i.id, i]));
  const out: RatingItem[] = [];

  Object.entries(checkResults).forEach(([id, res]) => {
    const img = mapById.get(id);
    if (!img) return;

    const regStatus: FieldStatus | "none" = (res.regnum as FieldStatus) ?? "none";
    const provStatus: FieldStatus | "none" = (res.province as FieldStatus) ?? "none";

    const c = correctionTexts[id] || {};
    
    // ให้ value ไปอยู่ใน field นั้นๆ เลย
    const regValue = regStatus === "reject" ? (c.regnum?.trim() || img.regnum) : img.regnum;
    const provValue = provStatus === "reject" ? (c.province?.trim() || img.province) : img.province;

    // ถ้าเป็น reject แต่ไม่ได้ใส่ค่าใหม่ ให้ข้ามรายการนั้น
    if ((regStatus === "reject" && !regValue) || (provStatus === "reject" && !provValue)) {
      return;
    }

    // คำนวณ status: reject ถ้ามีอันใดอันหนึ่งเป็น reject, accept ถ้าทั้งคู่เป็น accept
    const status: "accept" | "reject" = (regStatus === "reject" || provStatus === "reject") ? "reject" : "accept";
    // sent data
    out.push({
      id: img.id,
      name: img.name,
      subId: img.subId,
      regnum: regValue, // ไม่แยก status/value แล้ว
      province: provValue, // ไม่แยก status/value แล้ว
      status, // เพิ่ม status field
    });
  });

  return out;
}
// ==== END NEW ====

export interface ImageData {
  id: string;
  name: string;
  subId: string;
  url: string;
  url2: string;
  province: string;
  regnum: string;
  timestamp: string;
  dimensions?: string;
  uploadDate?: string;
}


// สร้าง Component Card แยกออกมา เพื่อให้จัดการ state ของแต่ละ Card ได้ง่าย
// และสามารถรับ props จาก parent component ได้
interface ImageCardComponentProps {
  image: ImageData;
  showCheckRateMode: boolean;
  checkResults: Record<
    string,
    { regnum?: "accept" | "reject"; province?: "accept" | "reject" }
  >;
  correctionTexts?: Record<string, { regnum?: string; province?: string }>;
  showInputFields: Record<string, { regnum?: boolean; province?: boolean }>;
  onCheck: (
    id: string,
    field: "regnum" | "province",
    result: "accept" | "reject"
  ) => void;
  onSaveCorrection: (
    imageId: string,
    field: "regnum" | "province",
    value: string
  ) => void;
  onCancelCorrection: (imageId: string, field: "regnum" | "province") => void;
  setSelectedImagePopup: (url: string) => void;
  // ใหม่: ผล rating จาก API (optional)
  apiRating?: listRateItem | null;
}

function ImageCardComponent({
  image,
  showCheckRateMode,
  checkResults,
  correctionTexts,
  showInputFields,
  onCheck,
  onSaveCorrection,
  onCancelCorrection,
  setSelectedImagePopup,
  apiRating,
  pendingRating,
}: ImageCardComponentProps & { pendingRating?: "accept"|"reject" }) {
  // ใช้ utility function เพื่อคำนวณสถานะสุดท้าย (ส่ง optimistic/pending เข้าไปด้วย)
  const localCheck = checkResults[image.id];
  const apiStatus = apiRating?.status as "accept" | "reject" | undefined;
  const optimistic = pendingRating;
  const finalStatus: FinalStatus = resolveFinalStatus(localCheck, apiStatus, optimistic);

  // ถ้ามี API rating แล้ว ให้ใช้ API เป็นหลัก ไม่อนุญาตให้แก้ไข local
  const isRated = !!apiRating;
  const shouldShowInputs = !isRated && showInputFields[image.id];

  // เก็บค่าเดิมไว้สำหรับการแสดงผลในส่วนอื่น ๆ
  const regnumResult = checkResults[image.id]?.regnum;
  const provinceResult = checkResults[image.id]?.province;

  // State สำหรับ input ในการแก้ไข
  const [regnumInput, setRegnumInput] = React.useState("");
  const [provinceInput, setProvinceInput] = React.useState("");

  // Debounce สำหรับ auto-save
  React.useEffect(() => {
    if (regnumInput.trim() && shouldShowInputs && showInputFields[image.id]?.regnum) {
      const timer = setTimeout(() => {
        onSaveCorrection(image.id, "regnum", regnumInput.trim());
        setRegnumInput("");
      }, 2000); // รอ 2 วินาทีหลังจากหยุดพิมพ์

      return () => clearTimeout(timer);
    }
  }, [regnumInput, image.id, shouldShowInputs, showInputFields, onSaveCorrection]);

  React.useEffect(() => {
    if (provinceInput.trim() && shouldShowInputs && showInputFields[image.id]?.province) {
      const timer = setTimeout(() => {
        onSaveCorrection(image.id, "province", provinceInput.trim());
        setProvinceInput("");
      }, 2000); // รอ 2 วินาทีหลังจากหยุดพิมพ์

      return () => clearTimeout(timer);
    }
  }, [provinceInput, image.id, shouldShowInputs, showInputFields, onSaveCorrection]);
  return (
    <Card className="group hover:shadow-lg transition-shadow p-0">
      {/* รูปภาพ (Original/Processed) */}
      <div className="flex p-2 relative">
        {/* Status Badge - แสดงเมื่อมีการ Check Rate แล้ว หรือมีข้อมูลจาก API (แสดงเสมอ) */}
        {finalStatus && (
          <div
            className={`absolute top-4 right-4 z-10 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg
                        ${
                          finalStatus === "modified"
                            ? "bg-orange-500 text-white"
                            : "bg-green-500 text-white"
                        }`}
          >
            {finalStatus === "modified" ? (
              <>
                <X className="h-3 w-3" />
                Modified
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Verified
              </>
            )}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <img
            src={image.url || "/placeholder.svg"}
            alt={image.name}
            className="object-contain rounded-4xl w-full h-40 transition duration-200 group-hover:brightness-75 cursor-pointer m-0 p-0 border-b-0"
            onClick={() => setSelectedImagePopup(image.url)}
            style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          />
        </div>
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <img
            src={image.url2 || "/placeholder.svg"}
            alt={image.name + "-processed"}
            className="object-contain rounded-4xl w-full h-40 transition duration-200 group-hover:brightness-75 cursor-pointer m-0 p-0 border-b-0"
            onClick={() => setSelectedImagePopup(image.url2)}
            style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          />
        </div>
      </div>
      {/* กล่องข้อมูลด้านล่าง */}
  <div className="bg-card text-card-foreground rounded-b-lg p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-2">{image.name}</h3>

        {/* Reg Num Section */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1">
            <span className="text-sm">
              Reg Num:{" "}
              <span className="font-bold text-base">{image.regnum}</span>
            </span>
            {/* แสดงข้อความแก้ไข */}
            {regnumResult === "reject" &&
              correctionTexts?.[image.id]?.regnum && (
                <div className="text-xs text-green-600 mt-1">
                  Corrected to:{" "}
                  <span className="font-semibold">
                    {correctionTexts[image.id].regnum}
                  </span>
                </div>
              )}
            {/* แสดง input field เมื่อกดปุ่ม reject (เฉพาะเมื่อยังไม่ถูก rate จาก API) */}
            {shouldShowInputs && showInputFields[image.id]?.regnum && (
              <div className="mt-2 space-y-2">
                <Input
                  value={regnumInput}
                  onChange={(e) => setRegnumInput(e.target.value)}
                  placeholder="Enter correct registration number... (auto-save)"
                  className="w-full text-sm"
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {regnumInput.trim()
                      ? "Typing... will auto-save in 2 seconds"
                      : "Type the correct text"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onCancelCorrection(image.id, "regnum");
                      setRegnumInput("");
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* แสดงปุ่ม Check/Cross ถ้า showCheckRateMode เป็น true */}
          {showCheckRateMode ? (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 mr-2"
                onClick={() => onCheck(image.id, "regnum", "accept")}
                disabled={isRated}
                title={isRated ? "Already rated via API" : "Accept"}
              >
                <Check className="h-6 w-6 text-green-600 flex-none" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onCheck(image.id, "regnum", "reject")}
                disabled={isRated}
                title={isRated ? "Already rated via API" : "Reject"}
              >
                <X className="h-6 w-6 text-red-500 flex-none" />
              </Button>
            </div>
          ) : (
            // แสดงผล Accept/Reject ถ้ามีการตรวจสอบแล้ว และไม่ได้อยู่ใน Check Rate Mode
            // ใช้ finalStatus แทน regnumResult เพื่อรองรับทั้ง local และ API data
            (regnumResult || (finalStatus && apiRating)) && (
              <span
                className={`font-bold text-lg ${
                  (regnumResult === "accept" || (finalStatus === "verified" && apiRating)) 
                    ? "text-green-600" : "text-red-600"
                }`}
              >
                {(regnumResult === "accept" || (finalStatus === "verified" && apiRating)) ? "✓" : "✗"}
              </span>
            )
          )}
        </div>

        {/* Province Section */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1">
            <span className="text-sm">
              Province:{" "}
              <span className="font-bold text-base">{image.province}</span>
            </span>
            {/* แสดงข้อความแก้ไข */}
            {provinceResult === "reject" &&
              correctionTexts?.[image.id]?.province && (
                <div className="text-xs text-green-600 mt-1">
                  Corrected to:{" "}
                  <span className="font-semibold">
                    {correctionTexts[image.id].province}
                  </span>
                </div>
              )}
            {/* แสดง input field เมื่อกดปุ่ม reject (เฉพาะเมื่อยังไม่ถูก rate จาก API) */}
            {shouldShowInputs && showInputFields[image.id]?.province && (
              <div className="mt-2 space-y-2">
                <Input
                  value={provinceInput}
                  onChange={(e) => setProvinceInput(e.target.value)}
                  placeholder="Enter correct province... (auto-save)"
                  className="w-full text-sm"
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {provinceInput.trim()
                      ? "Typing... will auto-save in 2 seconds"
                      : "Type the correct text"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onCancelCorrection(image.id, "province");
                      setProvinceInput("");
                    }}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          {showCheckRateMode ? (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 mr-2"
                onClick={() => onCheck(image.id, "province", "accept")}
                disabled={isRated}
                title={isRated ? "Already rated via API" : "Accept"}
              >
                <Check className="h-6 w-6 text-green-600 flex-none" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => onCheck(image.id, "province", "reject")}
                disabled={isRated}
                title={isRated ? "Already rated via API" : "Reject"}
              >
                <X className="h-6 w-6 text-red-500 flex-none" />
              </Button>
            </div>
          ) : (
            // แสดงผล Accept/Reject ถ้ามีการตรวจสอบแล้ว และไม่ได้อยู่ใน Check Rate Mode  
            // ใช้ finalStatus แทน provinceResult เพื่อรองรับทั้ง local และ API data
            (provinceResult || (finalStatus && apiRating)) && (
              <span
                className={`font-bold text-lg ${
                  (provinceResult === "accept" || (finalStatus === "verified" && apiRating)) 
                    ? "text-green-600" : "text-red-600"
                }`}
              >
                {(provinceResult === "accept" || (finalStatus === "verified" && apiRating)) ? "✓" : "✗"}
              </span>
            )
          )}
        </div>

        <hr className="my-2" />
        <div className="flex items-center justify-between">
          <span>Timestamp:</span>
          <span className="font-bold">{formatDate(image.timestamp)}</span>
        </div>
      </div>
    </Card>
  );
}

// Main ImageLogPage -------------------------------------------------------------
type StatusFilter = "verified" | "modified";

export function ImageLogPage() {
  // --- Download Modal State ---
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  // ใช้ DatePicker 2 ตัวสำหรับเลือก start/end
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // Status filter สำหรับ Download
  const [downloadStatusFilter, setDownloadStatusFilter] = useState<StatusFilter>("verified");
  
  // แก้ไข timezone issue โดยใช้ local date format แทน ISO
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // เก็บเป็น string สำหรับ payload โดยใช้ local date
  const downloadDateRange = startDate && endDate
    ? [formatLocalDate(startDate), formatLocalDate(endDate)]
    : null;

  // --- Success Modal State ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "Success"
  });

  // Debug: Simple useEffect to check if API sends payload
  useEffect(() => {
    async function fetchRates() {
      try {
        // await ocrServicesRateModelService.downloadZip();
        // console.log('response type:', typeof listRateRes);
        // console.log('is array:', Array.isArray(listRateRes));
        // if (listRateRes && typeof listRateRes === 'object') {
        //   console.log('response keys:', Object.keys(listRateRes));
        //   if (listRateRes.data) {
        //     console.log('response.data:', listRateRes.data);
        //     console.log('response.data type:', typeof listRateRes.data);
        //     if (Array.isArray(listRateRes.data)) {
        //       console.log('response.data length:', listRateRes.data.length);
        //     }
        //   }
        // }  catch (err) {
      } catch (err) {

      }
    }
    fetchRates();
  }, []);

  const { subId } = useSubIdContext();
  useAuthenticatedApi();
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode] = useState<"grid" | "list">("grid");
  const [pageLimit, setPageLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImagePopup, setSelectedImagePopup] = useState<string | null>(null);

  // State สำหรับตัวกรองสถานะ
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "modified" | "unrated">("all");

  // State สำหรับเก็บผลจาก List Rate API
  const [apiRatings, setApiRatings] = useState<Record<string, listRateItem>>({});

  // State สำหรับควบคุม Check Rate Mode (จะถูกผูกกับ Switch ใน Header)
  const [isCheckRateMode, setIsCheckRateMode] = useState(false);

  // --- เพิ่ม pendingRatings state และ effect ---
  const [pendingRatings, setPendingRatings] = useState<Record<string, "accept"|"reject">>(() => {
    if (typeof window !== 'undefined' && subId) {
      try { return JSON.parse(localStorage.getItem(`pendingRatings_${subId}`) || "{}"); } catch {}
    }
    return {};
  });

  useEffect(() => {
    if (subId) localStorage.setItem(`pendingRatings_${subId}`, JSON.stringify(pendingRatings));
  }, [pendingRatings, subId]);

  // รีแฟกเตอร์ fetch function ให้เรียกซ้ำได้
  const fetchApiRatings = useCallback(async () => {
    if (!subId) {
      setApiRatings({});
      return;
    }

    try {
      // รองรับ method ต่าง ๆ ที่ service อาจมี
      let res;
      if (rateModelService.listRate) {
        res = await rateModelService.listRate(subId);
      } else if (rateModelService.listRateLog) {
        res = await rateModelService.listRateLog(subId);
      } else {
        setApiRatings({});
        return;
      }

      // มาตรฐานผลลัพธ์: ถ้าได้ { data: [...] } ให้ใช้ data, ถ้าเป็น array ก็ใช้ตรงๆ
      const items: any[] = Array.isArray(res) ? res : res?.data ?? [];
      
      ({
        subId,
        totalItems: items.length,
        items: items.map(item => ({
          logId: item.logId || item.id || item._id,
          status: item.status,
          regnum: item.regnum || item.regNum,
          province: item.province
        }))
      });

      const map: Record<string, listRateItem> = {};

      items.forEach((raw) => {
        const logId = raw.logId ?? raw.id ?? raw._id; // เผื่อระหว่างเปลี่ยนผ่าน
        if (!logId) {
          console.warn('[API_PARSE] Skipping item - no logId found:', raw);
          return;
        }
        
        const rawStatus = raw.status;
        const status = normalizeApiStatus(rawStatus); // "accept" | "reject" | undefined
        
        ({
          logId,
          rawStatus,
          normalizedStatus: status,
          regnum: raw.regNum ?? raw.regnum,
          province: raw.province
        });
        
        if (!status) {
          console.warn(`[API_PARSE] Skipping item - invalid status "${rawStatus}" for logId ${logId}`);
          return; // ถ้า status ไม่ชัด ให้ข้าม ป้องกัน badge หาย
        }

        // Ensure subId is present (fallback to current subId if missing)
        const subIdOrg = raw.subId ?? subId ?? "";

        map[logId] = {
          logId,
          status,
          regNum: raw.regNum ?? raw.regnum ?? "",     // จับทั้ง regNum/regnum
          province: raw.province ?? "",
          imgName: raw.imgName,
          _id: raw._id,
          updateAt: raw.updateAt,
          subId: subIdOrg,
        } as listRateItem;

         ({
          logId,
          status,
          regnum: raw.regNum ?? raw.regnum,
          province: raw.province,
          subId: subIdOrg
        });
      });

      setApiRatings(map);
      ({
        totalKeys: Object.keys(map).length,
        logIds: Object.keys(map)
      });
    } catch (e) {
      console.error('[API] listRate error:', e);
      setApiRatings({});
    }
  }, [subId]);

  // Effect สำหรับ fetch List Rate จาก API
  useEffect(() => {
    fetchApiRatings();
  }, [fetchApiRatings]);  const [checkResults, setCheckResults] = useState<
    Record<
      string,
      { province?: "accept" | "reject"; regnum?: "accept" | "reject" }
    >
  >(() => {
    // โหลดจาก localStorage เมื่อเริ่มต้น (เฉพาะเมื่อยังไม่มี API data)
    if (typeof window !== 'undefined' && subId) {
      const saved = localStorage.getItem(`checkResults_${subId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          console.warn('[STORAGE] Failed to parse checkResults from localStorage:', e);
        }
      }
    }
    return {};
  });

  // State สำหรับควบคุม Dialog สรุปผล
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  // State สำหรับเก็บข้อมูลที่จะแสดงใน Dialog
  const [modifiedCardsSummary, setModifiedCardsSummary] = useState<RatingItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [correctionTexts, setCorrectionTexts] = useState<
    Record<string, { regnum?: string; province?: string }>
  >(() => {
    // โหลดจาก localStorage เมื่อเริ่มต้น
    if (typeof window !== 'undefined' && subId) {
      const saved = localStorage.getItem(`correctionTexts_${subId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch (e) {
          console.warn('[STORAGE] Failed to parse correctionTexts from localStorage:', e);
        }
      }
    }
    return {};
  });
  // State สำหรับแสดง input fields ในการ์ด
  const [showInputFields, setShowInputFields] = useState<
    Record<string, { regnum?: boolean; province?: boolean }>
  >({});

  // Effect เพื่อบันทึกลง localStorage เมื่อ checkResults เปลี่ยน
  useEffect(() => {
    if (subId && Object.keys(checkResults).length > 0) {
      localStorage.setItem(`checkResults_${subId}`, JSON.stringify(checkResults));
    }
  }, [checkResults, subId]);

  // Effect เพื่อบันทึกลง localStorage เมื่อ correctionTexts เปลี่ยน
  useEffect(() => {
    if (subId && Object.keys(correctionTexts).length > 0) {
      localStorage.setItem(`correctionTexts_${subId}`, JSON.stringify(correctionTexts));
    }
  }, [correctionTexts, subId]);

  // Effect: Reconcile local state after API confirms items (only clear for items confirmed by API)
  useEffect(() => {
    if (Object.keys(apiRatings).length === 0) return;

    const newCheck = { ...checkResults };
    const newCorr  = { ...correctionTexts };
    const newPend  = { ...pendingRatings };
    let changed = false;

    Object.keys(apiRatings).forEach(logId => {
      const apiRating = apiRatings[logId];
      ({
        hasLocalCheck: !!newCheck[logId],
        hasLocalCorr: !!newCorr[logId],
        hasPending: !!newPend[logId],
        apiStatus: apiRating.status
      });

      if (newCheck[logId]) {
        console.log(`[RECONCILE] Clearing local checkResults for "${logId}":`, newCheck[logId]);
        delete newCheck[logId]; 
        changed = true; 
      }
      if (newCorr[logId]) {
        console.log(`[RECONCILE] Clearing local correctionTexts for "${logId}":`, newCorr[logId]);
        delete newCorr[logId];  
        changed = true; 
      }
      if (newPend[logId]) {
        console.log(`[RECONCILE] Clearing pending rating for "${logId}":`, newPend[logId]);
        delete newPend[logId];  
        changed = true; 
      }
    });

    if (changed) {
      console.log('[RECONCILE] State updated - cleared local data for API-confirmed items');
      setCheckResults(newCheck);
      setCorrectionTexts(newCorr);
      setPendingRatings(newPend);
    } else {

    }
  }, [apiRatings]);
  const handleCheck = (
    imageId: string,
    field: "province" | "regnum",
    result: "accept" | "reject"
  ) => {
    // ตรวจสอบว่ามี API rating แล้วหรือไม่ (ใช้ logId ตรงๆ)
    const hasApiRating = !!apiRatings[imageId];

    if (hasApiRating) {
      console.log(`[RATE_BLOCKED] Cannot rate ${imageId} - already rated via API`);
      alert("This image has already been rated via API and cannot be modified");
      return;
    }

    if (result === "reject") {
      setShowInputFields((prev) => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          [field]: true,
        },
      }));
      return; // ไม่บันทึก checkResults ก่อน ให้รอการป้อนข้อมูล
    }

    // ถ้า accept ให้บันทึกทันที
    setCheckResults((prev) => {
      const newResults = {
        ...prev,
        [imageId]: {
          ...prev[imageId],
          [field]: result,
        },
      };
      console.log(`[RATE_LOCAL] Set ${imageId}.${field} = ${result}`);
      return newResults;
    });
  };
  const handleSaveCorrection = (
    imageId: string,
    field: "province" | "regnum",
    correctionValue: string
  ) => {
    if (correctionValue.trim()) {
      // บันทึกข้อความแก้ไข
      setCorrectionTexts((prev) => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          [field]: correctionValue.trim(),
        },
      }));

      // บันทึก reject status
      setCheckResults((prev) => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          [field]: "reject",
        },
      }));

      // ซ่อน input field
      setShowInputFields((prev) => ({
        ...prev,
        [imageId]: {
          ...prev[imageId],
          [field]: false,
        },
      }));
    }
  };

  const handleCancelCorrection = (
    imageId: string,
    field: "province" | "regnum"
  ) => {
    // ซ่อน input field
    setShowInputFields((prev) => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        [field]: false,
      },
    }));
  };
  //  log query โดยไม่ส่ง search (filter ที่ frontend แทน)
  const ocrLogsQuery = useOcrLogs({
    page: currentPage,
    limit: pageLimit,
  });

  // Image Data *** 
  const images: ImageData[] = React.useMemo(() => {
    // create img data
    const baseImages = (
      ocrLogsQuery.data?.data?.map((item: any, idx: number) => {
        const processedUrl = item.message?.images?.processed || "";
        const fileName = getFileNameFromUrl(processedUrl);
        // ข้อมูลพื้นฐานจาก OCR
        const baseImageData = {
          id: item._id,
          name: fileName.replace("cropped_", "") || `Image Result ${idx + 1}`,
          subId: item.message?.subId || "",
          url: item.message?.images?.original || "",
          url2: processedUrl,
          province: item.message?.content?.province || "",
          regnum: item.message?.content?.["reg-num"] || "",
          timestamp: item.timestamp || "",
          dimensions: item.dimensions || "",
          uploadDate: item.uploadDate || "",
        };
        // Check API rating for image or not
        const apiRating = apiRatings[item._id];
       
        // if has API rating and status = "reject" will use value from API 
        if (apiRating && apiRating.status === "reject") {
          return {
            ...baseImageData,
            regnum: apiRating.regNum || baseImageData.regnum,
            province: apiRating.province || baseImageData.province,
          };
        }
        return baseImageData;
      }) || []
    );
    
    // if dont use search bar will use baseImages
    if (!searchTerm.trim()) return baseImages;
    
    // change string to lowecase
    const term = searchTerm.trim().toLowerCase();

    // filter: id or imgname 
    return baseImages.filter(img => {
      const name = (img.name || "").toLowerCase();
      const id = (img.id || "").toLowerCase();
      return name.includes(term) || id.includes(term);
    });
  }, [ocrLogsQuery.data?.data, apiRatings, searchTerm]);

  // Debug useEffect สำหรับตรวจสอบ ID mapping - ต้องอยู่หลัง images
  useEffect(() => {
    if (!images.length || !Object.keys(apiRatings).length) return;
    
    let matchCount = 0;
    let mismatchCount = 0;
    
    images.forEach(img => {
      const api = apiRatings[img.id];
      if (!api) {
        mismatchCount++;
      } else {
        matchCount++;
      }
    });
    
  }, [images, apiRatings]);

  React.useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setStatusFilter("all"); // รีเซ็ตตัวกรองสถานะ
    setIsCheckRateMode(false); // ปิดโหมดเมื่อเปลี่ยน Organization
    setCheckResults({}); // เคลียร์ผลลัพธ์การตรวจสอบ
    setCorrectionTexts({}); // เคลียร์ข้อความแก้ไข
    setShowInputFields({}); // เคลียร์ input fields
    setModifiedCardsSummary([]); // เคลียร์ summary
    setShowSummaryDialog(false); // ปิด dialog
    
  }, [subId]);

  // Effect เพื่อตรวจสอบเมื่อ Check Rate Mode ถูกปิด
  // และประมวลผลข้อมูลสำหรับ Summary Dialog
  const prevIsCheckRateMode = React.useRef(isCheckRateMode);
  React.useEffect(() => {
    if (prevIsCheckRateMode.current === true && isCheckRateMode === false) {
      const modified = buildModifiedSummary(images, checkResults, correctionTexts,);
      setModifiedCardsSummary(modified);
      setShowSummaryDialog(modified.length > 0);
    }
    prevIsCheckRateMode.current = isCheckRateMode;
  }, [isCheckRateMode, checkResults, images, correctionTexts ]);

  const meta = {
    current_page: ocrLogsQuery.data?.current_page || 1,
    next_page: ocrLogsQuery.data?.next_page,
    prev_page: ocrLogsQuery.data?.prev_page,
    total_pages: ocrLogsQuery.data?.total_pages || 1,
    total_records: ocrLogsQuery.data?.total_records || 0,
  };

  const filteredImages = images.filter((image) => {
    // กรองตามคำค้นหา
    const matchesSearch = 
      image.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.province?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.regnum?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // กรองตามสถานะ
    if (statusFilter === "all") return true;

    const localCheck = checkResults[image.id];
    const apiRating = apiRatings[image.id]; // ใช้ logId ตรงๆ
    const apiStatus = apiRating?.status as "accept" | "reject" | undefined;
    const finalStatus = resolveFinalStatus(localCheck, apiStatus);

    
    switch (statusFilter) {
      case "verified":
        return finalStatus === "verified";
      case "modified":
        return finalStatus === "modified";
      case "unrated":
        return !finalStatus;
      default:
        return true;
    }
  });

  const handleDownloadZip = async (uiStatus: StatusFilter) => {
    const statusMap: Record<StatusFilter, "accept" | "reject"> = {
      verified: "accept",
      modified: "reject"
    };
    const backendStatus = statusMap[uiStatus];
    
    if (!subId) {
      alert("Organization ID is required for download!");
      return;
    }

    if (!downloadDateRange) {
      alert("Please select both start and end dates!");
      return;
    }

    // Validate date range
    const [startDateStr, endDateStr] = downloadDateRange;
    const startDateObj = new Date(startDateStr);
    const endDateObj = new Date(endDateStr);
    
    if (endDateObj < startDateObj) {
      alert("End date must be after start date!");
      return;
    }

    

    // แสดง loading state
    const button = document.querySelector(
      "[data-download-btn]"
    ) as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.textContent = "Preparing download...";
    }

    try {
      
      // Check if user is authenticated
      if (!user) {
        alert("Authentication required! Please login first.");
        return;
      }

      // Change text button
      if (button) button.textContent = "Downloading...";
      
      // Download ZIP
      // Fix This********************************
      // ยังไม่ได้ใส่ token ตรงนี้ แล้วก็ใน service ที่ดึงฝากด้วย
      // const [startDate, setStartDate] = useState<string>('');
      // const [endDate, setEndDate] = useState<string>('');
      const [startDate, endDate] = downloadDateRange || ["", ""];
      await ocrServicesRateModelService.downloadZip(subId, backendStatus, startDate, endDate );

      // Success feedback with SuccessModal
      setSuccessMessage({
        title: "Download Complete! ✅"
      });
      setShowSuccessModal(true);

    } catch (error) {

      if (error instanceof Error) {
        switch (error.name) {
          case "AbortError":
            alert(
              "Download was cancelled due to timeout (15 minutes). The dataset is very large.\n\nOptions:\n1. Try again when server is less busy\n2. Contact administrator\n3. Download in smaller batches"
            );
          break;
          case "TypeError":
            if (error.message.includes("Failed to fetch")) {
              alert("Network error: Unable to connect to server. Please check if the API server is running.");
            } else {
              alert(`TypeError: ${error.message}`);
            }
          break;
          default:
            alert(`Failed to download ZIP file: ${error.message}\n\nPlease check console for details.`);
      }

    // console.error(error);

  } 

    } finally {
      // Reset button state
      if (button) {
        button.disabled = false;
        button.innerHTML =
          '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Download ZIP';
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setPageLimit(limit);
    setCurrentPage(1);
  };

  // checkRate Submit Handler -------------------------------------------
  const handleSubmit = useCallback(async () => {
    const items = buildModifiedSummary(images, checkResults, correctionTexts);
    if (items.length === 0) { alert("No items to send"); return; }

    setSubmitting(true);
    try {
      // optimistic: mark as pending
      setPendingRatings(prev => {
        const next = { ...prev };
        for (const it of items) next[it.id] = it.status; // "accept"|"reject"
        return next;
      });

      await rateModelService.checkRateModel(items);
      setShowSummaryDialog(false);

      // ดึง API ใหม่
      await fetchApiRatings();
    } catch (e) {
      // rollback optimistic
      setPendingRatings(prev => {
        const next = { ...prev };
        for (const it of items) delete next[it.id];
        return next;
      });
      alert("Some items failed to send");
    } finally {
      setSubmitting(false);
    }
  }, [images, checkResults, correctionTexts, fetchApiRatings, subId]);

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to access the Image Log page.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="pt-0 px-6 pb-6 bg-background text-foreground min-h-screen">
      {/* Header */}

      <div className="flex items-center justify-between mb-6">
        {/* ส่วนของชื่อหน้าและ Organization */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">
            Image Log
            {ocrLogsQuery.isFetching && !ocrLogsQuery.isLoading && (
              <span className="ml-2 text-sm text-blue-600 dark:text-blue-300">
                (refreshing...)
              </span>
            )}
          </h1>
          <p className="text-muted-foreground truncate">
            Manage and organize all your images
          </p>
          {/* บรรทัดนี้ถูกย้ายและปรับแต่งให้มีขนาดเล็กลง */}
          <p className="text-muted-foreground truncate text-sm">
            Organization: <span className="font-semibold text-foreground">{subId}</span>
          </p>
        </div>

        {/* กลุ่ม Check Rate, Download, Search, Filter */}
        <div className="flex items-center gap-3">
          {/* Check Rate Mode */}
          <div className="flex items-center gap-2">
            <Switch
              id="check-rate-mode"
              checked={isCheckRateMode}
              onCheckedChange={setIsCheckRateMode} // ใช้ setIsCheckRateMode ที่นี่
            />
            <label
              htmlFor="check-rate-mode"
              className="text-sm font-medium"
            >
              Check Rate Mode
            </label>
          </div>

          {/* Download ZIP (open modal) */}
          <Button
            onClick={() => setDownloadModalOpen(true)}
            variant="outline"
            className="bg-white whitespace-nowrap"
            data-download-btn
            
          >
            <Download className="w-4 h-4 mr-2" />
            Download ZIP
          </Button>
      {/* Download Modal (ใช้ ShadcnDatePicker 2 ตัว) */}
      <Dialog open={isDownloadModalOpen} onOpenChange={setDownloadModalOpen}>
        <DialogContent className="!w-[570px] !max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>Download ZIP</DialogTitle>
            <DialogDescription>
              เลือกวันเริ่มต้นและวันสิ้นสุดที่ต้องการดาวน์โหลดไฟล์ ZIP
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 py-2">
            <div className="flex-[2]">
              <p className="text-sm font-medium mb-2">วันที่เริ่มต้น</p>
              <ShadcnDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="flex-[2]">
              <p className="text-sm font-medium mb-2">วันที่สิ้นสุด</p>
              <ShadcnDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
              />
            </div>
            <div className="flex-[1] min-w-[120px]">
              <p className="text-sm font-medium mb-2">Status</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10 px-3 py-2 text-sm bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground"
                  >
                    {downloadStatusFilter === "verified" ? "Verified" : "Modified"}
                    <svg className="w-4 h-4 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[120px]" align="start" side="bottom" sideOffset={4} avoidCollisions={false}>
                  <DropdownMenuItem onClick={() => setDownloadStatusFilter("verified")}>
                    🟢 Verified
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDownloadStatusFilter("modified")}>
                    🟠 Modified
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                handleDownloadZip(downloadStatusFilter);
                setDownloadModalOpen(false);
              }}
              disabled={!downloadDateRange}
            >
              Confirm Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white"
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white whitespace-nowrap"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filter ({pageLimit}/page)
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleLimitChange(10)}>
                Show 10 items/page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLimitChange(25)}>
                Show 25 items/page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLimitChange(50)}>
                Show 50 items/page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLimitChange(100)}>
                Show 100 items/page
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-white whitespace-nowrap"
              >
                Status: {statusFilter === "all" ? "All" : 
                        statusFilter === "verified" ? "Verified" : 
                        statusFilter === "modified" ? "Modified" : "Unrated"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("verified")}>
                🟢 Verified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("modified")}>
                🟠 Modified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("unrated")}>
                ⚪ Unrated
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center bg-card text-card-foreground">
            <div className="text-2xl font-bold text-foreground">
              {meta.total_records}
            </div>
            <div className="text-sm text-muted-foreground">Total Images</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center bg-card text-card-foreground">
            <div className="text-2xl font-bold text-foreground">
              {meta.total_pages}
            </div>
            <div className="text-sm text-muted-foreground">Total Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center bg-card text-card-foreground">
            <div className="text-2xl font-bold text-foreground">
              {currentPage}
            </div>
            <div className="text-sm text-muted-foreground">Current Page</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center bg-card text-card-foreground">
            <div className="text-2xl font-bold text-foreground">
              {filteredImages.length}
            </div>
            <div className="text-sm text-muted-foreground">Filtered Results</div>
          </CardContent>
        </Card>
        {/* แสดงสถิติการ Check Rate เมื่ออยู่ในโหมด Check Rate */}
        <Card className={isCheckRateMode ? "border-blue-200 bg-blue-50 dark:border-blue-400 dark:bg-blue-950" : ""}>
          <CardContent className="p-4 text-center bg-card text-card-foreground">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {Object.keys(checkResults).length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-300">
              {isCheckRateMode ? "Checked Items" : "Last Checked"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Loading Wrapper */}
      <QueryLoadingWrapper
        query={ocrLogsQuery}
        loadingText="Loading images..."
        emptyMessage="No images found"
      >
        {() => (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <ImageCardComponent
                    key={image.id}
                    image={image}
                    showCheckRateMode={isCheckRateMode}
                    checkResults={checkResults}
                    correctionTexts={correctionTexts}
                    showInputFields={showInputFields}
                    onCheck={handleCheck}
                    onSaveCorrection={handleSaveCorrection}
                    onCancelCorrection={handleCancelCorrection}
                    setSelectedImagePopup={setSelectedImagePopup}
                    apiRating={apiRatings[image.id]}
                    pendingRating={pendingRatings[image.id]}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredImages.map((image) => {
                  // คำนวณ finalStatus สำหรับ List View (ส่ง optimistic/pending เข้าไปด้วย)
                  const localCheck = checkResults[image.id];
                  const apiRating = apiRatings[image.id];
                  const apiStatus = apiRating?.status as "accept" | "reject" | undefined;
                  const optimistic = pendingRatings[image.id];
                  const finalStatus = resolveFinalStatus(localCheck, apiStatus, optimistic);

                  return (
                    <Card key={image.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            {/* ใช้ finalStatus แทน checkResults โดยตรง */}
                            {finalStatus && (
                              <div
                                className={`absolute -top-1 -right-1 z-10 px-1 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg
                                  ${finalStatus === "modified" ? "bg-orange-500 text-white" : "bg-green-500 text-white"}`}
                              >
                                {finalStatus === "modified" ? (
                                  <X className="h-2 w-2" />
                                ) : (
                                  <Check className="h-2 w-2" />
                                )}
                              </div>
                            )}
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              className="object-cover rounded w-full h-full"
                            />
                          </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {image.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{image.dimensions}</span>
                            <span>{image.uploadDate}</span>
                            <span>Province: {image.province}</span>
                            <span>Reg Num: {image.regnum}</span>
                            <span>Time: {image.timestamp}</span>
                          </div>
                        </div>
                        {/* เพิ่มปุ่ม Check/Cross ใน List View ด้วย ถ้าต้องการ */}
                        {isCheckRateMode && (
                          <div className="flex items-center ml-auto">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700 mr-2"
                              onClick={() =>
                                handleCheck(image.id, "regnum", "accept")
                              }
                            >
                              <Check className="h-6 w-6 text-green-600 flex-none" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() =>
                                handleCheck(image.id, "regnum", "reject")
                              }
                            >
                              <X className="h-6 w-6 text-red-500 flex-none" />
                            </Button>
                          </div>
                        )}
                        {/* แสดงสถานะเมื่อไม่ได้อยู่ใน Check Rate Mode (ใช้ finalStatus) */}
                        {!isCheckRateMode && finalStatus && (
                          <span
                            className={`font-bold text-lg ${finalStatus === "verified" ? "text-green-600" : "text-red-600"}`}
                          >
                            {finalStatus === "verified" ? "✓" : "✗"}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>

              {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map(
                (page) =>
                  Math.abs(page - currentPage) <= 2 ||
                  page === 1 ||
                  page === meta.total_pages ? (
                    <Button
                      key={page}
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(page)}
                      className={page === currentPage ? "bg-gray-100 text-gray-700 font-semibold" : "text-gray-600"}
                    >
                      {page}
                    </Button>
                  ) : (
                    (page === currentPage - 3 || page === currentPage + 3) && (
                      <span key={page} className="text-gray-400">...</span>
                    )
                  )
              )}

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === meta.total_pages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </QueryLoadingWrapper>

      {/* Popup Modal for viewing images */}
      {selectedImagePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedImagePopup(null)}
        >
          <div
            className="relative max-w-3xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
              onClick={() => setSelectedImagePopup(null)}
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedImagePopup}
              alt="popup"
              className="rounded-lg max-h-[80vh] max-w-full shadow-lg border-2 border-white"
            />
          </div>
        </div>
      )}

      {/* Summary Dialog - เพิ่มส่วนนี้เข้ามา */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Image Rating Summary</DialogTitle>
            <DialogDescription>
              Here are the Image Results that you have modified:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-60 overflow-y-auto">
            {modifiedCardsSummary.length === 0 ? (
              <p className="text-gray-500">No modified Image Results</p>
            ) : (
              <ul className="space-y-2">
                {modifiedCardsSummary.map((card) => (
                  <li
                    key={card.id}
                    className="flex justify-between items-center p-2 border rounded-md bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">{card.name}</p>
                      <p className="text-sm text-gray-600">
                        Reg Num: {card.regnum ?? "-"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Province: {card.province ?? "-"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        card.status === "accept" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {card.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        isVisible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
      />
    </div>
  );
}
