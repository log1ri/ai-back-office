import { BaseHttpClient } from './base-http-client';
// import type { ApiResponse, RateModelCheckRateResponse, RateModelItem, listRateItem } from '../types/api.types';

export class OcrServicesRateModelService extends BaseHttpClient {


  async downloadZip(subId:string, status:'accept'|'reject',startDate: Date|string, endDate: Date|string): Promise<void> {

    // --- Hardcoded params for testing ---
    // const subId = '686756400ae6dcd28bee12af';
    // const status = 'accept';
    // const startDate = '2025-09-09';
    // const endDate = '2025-09-10';

    // --- Validate inputs ---
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('Invalid date format. Please use YYYY-MM-DD or a valid Date object.');
      return;
    }
    if (end < start) {
      alert('End date must be after start date.');
      return;
    }

    // Ensure ISO 8601 date string (YYYY-MM-DD) - แก้ไข timezone issue
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const startIso = typeof startDate === 'string'
      ? startDate
      : formatLocalDate(startDate);
    const endIso = typeof endDate === 'string'
      ? endDate
      : formatLocalDate(endDate);
      
    

    const url = `/api/v1/ocr-services-imgs/download-zip?subId=${subId}&status=${status}&startDate=${startIso}&endDate=${endIso}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 900000);
    
    const authToken = localStorage.getItem('authToken');
    const headers: HeadersInit = {
      Accept: "application/zip, application/octet-stream, */*",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    // --- Error handling ---
    if (!response.ok) {
      await this.handleDownloadError(response);
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    // --- Blob and type checks ---
    const blob = await response.blob();
    if (blob.size === 0) {
      alert("Downloaded file is empty. This organization may not have any images available for download.");
      console.error("Blob size is 0 - no content received from server");
      return;
    }

    const contentType = response.headers.get("content-type");
    if (
      !contentType?.includes("zip") &&
      !contentType?.includes("octet-stream") &&
      blob.type !== "application/zip"
    ) {
      console.warn("Warning: Response may not be a ZIP file");
    }

    const urlObj = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = `${subId}_images.zip`;
    document.body.appendChild(a);
    
    setTimeout(() => {
      try {
        a.click();
      } catch (clickError) {
        console.error("Error triggering download:", clickError);
      }
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(urlObj);
      }, 100);
    }, 10);
  }

  // Handle Errors
  async handleDownloadError(response: Response) {
  const errorText = await response.text();
  let message = "Download failed!";
  switch (response.status) {
    case 401:
      message = "Authentication failed! Please login again.";
      break;
    case 403:
      message = "Access denied! You don't have permission to download files.";
      break;
    case 404:
      message = "No images found for this organization.";
      break;
    case 408:
    case 504:
      message = "Request timeout! The server took too long to process your request.";
      break;
    default:
      message = `Download failed: ${response.status} ${response.statusText}\n${errorText}`;
  }
  alert(message);
  console.error("Response error:", errorText);
}
  







}
