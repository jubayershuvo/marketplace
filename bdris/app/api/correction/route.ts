// app/api/birth-registration/correction/route.ts
import { connectDB } from "@/lib/mongodb";
import Currection from "@/models/Currection";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define types for the request body
interface CorrectionInfo {
  id: string;
  key: string;
  value: string;
  cause: string;
}

interface Address {
  country: string;
  geoId: string;
  division: string | number;
  divisionName: string;
  district: string | number;
  districtName: string;
  cityCorpCantOrUpazila: string | number;
  upazilaName: string;
  paurasavaOrUnion: string | number;
  unionName: string;
  postOfc: string;
  postOfcEn: string;
  vilAreaTownBn: string;
  vilAreaTownEn: string;
  houseRoadBn: string;
  houseRoadEn: string;
  ward: string | number;
  wardName: string;
}

interface ApplicantInfo {
  name: string;
  officeId?: number;
  email: string;
  phone: string;
  relationWithApplicant: string;
}

interface FileInfo {
  id: number;
  name: string;
  url: string;
  deleteUrl: string;
  attachmentTypeId: string;
  fileType: string;
}

interface CorrectionRequestBody {
  ubrn: string;
  dob: string;
  correctionInfos: CorrectionInfo[];
  addresses: {
    birthPlace: Address;
    permAddress: Address;
    prsntAddress: Address;
  };
  applicantInfo: ApplicantInfo;
  files: FileInfo[];
  otp: string;
  captcha: string;
  csrf: string;
  cookies: string[];
  isPermAddressIsSameAsBirthPlace: boolean;
  isPrsntAddressIsSameAsPermAddress: boolean;
}

// Helper function to check if string is HTML
function isHTML(str: string): boolean {
  return str.trim().startsWith("<!DOCTYPE") || str.trim().startsWith("<html");
}

// Helper function to parse response safely
async function safeParseResponse(response: Response) {
  const text = await response.text();

  // Ensure the /html directory exists
  const dir = path.join(process.cwd(), "html");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `currection.html`);

  // Write file
  await fs.promises.writeFile(filePath, text, "utf8");

  // console.log(`HTML page saved to: ${filePath}`);
  if (isHTML(text)) {
    if (text.includes("OTP NOT VERIFIED")) {
      return {
        success: false,
        message: "OTP not verified. Please check the OTP and try again.",
      };
    }

    const bdrisLink = "https://bdris.gov.bd";

    function extractData(html: string) {
      // 1️⃣ Extract ID (inside red span)
      const idRegex = /<span[^>]*color:red[^>]*>\s*([\d]+)\s*<\/span>/;
      const idMatch = html.match(idRegex);
      const applicationId = idMatch ? idMatch[1] : null;

      // 2️⃣ Extract success message (green message)
      const msgRegex =
        /<span[^>]*color:green[^>]*>\s*<b>\s*(.*?)\s*<\/b>\s*<\/span>/;
      const msgMatch = html.match(msgRegex);
      const message = msgMatch ? msgMatch[1] : null;

      // 3️⃣ Extract print link
      const printLinkRegex = /<a[^>]*id="appPrintBtn"[^>]*href="([^"]+)"/;
      const printMatch = html.match(printLinkRegex);
      const printLink = printMatch ? printMatch[1] : null;

      return {
        success: !!(applicationId && message && printLink),
        applicationId,
        message,
        cookieLink: bdrisLink + "/br/correction",
        printLink: printLink ? bdrisLink + printLink : null,
      };
    }

    const extracted = extractData(text);
    if (extracted.success) {
      return extracted;
    }

    // Check for common HTML error patterns
    if (
      text.includes("login") ||
      text.includes("session") ||
      text.includes("expired")
    ) {
      return {
        success: false,
        message: "Session expired or user not logged in. Please log in again.",
      };
    } else if (text.includes("CSRF") || text.includes("token")) {
      return {
        success: false,
        message: "CSRF token error. Please refresh and try again.",
      };
    } else if (response.status === 403) {
      return {
        success: false,
        message:
          "Access forbidden. You do not have permission to access this resource.",
      };
    } else if (response.status === 404) {
      return {
        success: false,
        message: "Resource not found. The requested endpoint does not exist.",
      };
    } else {
      return {
        success: false,
        message: "Unexpected HTML response received from server.",
      };
    }
  }

  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error("Failed to parse response as JSON:", text.substring(0, 500));
    return { success: false, message: "Failed to parse server response." };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CorrectionRequestBody = await request.json();

    await connectDB();
    const currection = await Currection.create(body);
    // Validate required fields
    if (
      !body.ubrn ||
      !body.otp ||
      !body.captcha ||
      !body.csrf ||
      !body.cookies ||
      !body.applicantInfo
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "অনুগ্রহ করে সকল আবশ্যক তথ্য প্রদান করুন।",
        },
        { status: 400 }
      );
    }

    // Validate applicant name (as in PHP)
    if (!body.applicantInfo.name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "আবেদনকারীর নাম নির্বাচন করুন, না হলে আবেদন জমা হবে না।",
        },
        { status: 400 }
      );
    }

    // Build correctionInfoJson array (similar to PHP logic)
    const correctionInfoArray = [];

    // Add personal info corrections
    body.correctionInfos.forEach((info) => {
      correctionInfoArray.push({
        id: info.key,
        val: info.value,
        cause: info.cause || "2",
      });
    });

    // Add address corrections
    const { birthPlace, permAddress, prsntAddress } = body.addresses;

    // Birth place address
    if (birthPlace && birthPlace.country !== "-1") {
      correctionInfoArray.push(
        {
          id: "birthPlaceLocationId",
          val: birthPlace.paurasavaOrUnion.toString(),
        },
        {
          id: "birthPlaceWardInPaurasavaOrUnion",
          val: birthPlace.ward.toString(),
        },
        {
          id: "birthPlaceEn",
          val: `${birthPlace.vilAreaTownEn} ${birthPlace.postOfcEn}`.trim(),
        },
        {
          id: "birthPlaceBn",
          val: `${birthPlace.vilAreaTownBn} ${birthPlace.postOfc}`.trim(),
        }
      );
    }
    // Present and Permanent addresses
    if (prsntAddress && prsntAddress.country !== "-1") {
      correctionInfoArray.push(
        {
          id: "prsntAddrLocationId",
          val: prsntAddress.paurasavaOrUnion.toString(),
        },
        {
          id: "prsntAddrWardInPaurasavaOrUnion",
          val: prsntAddress.ward.toString(),
        },
        {
          id: "prsntAddrEn",
          val: `${prsntAddress.vilAreaTownEn} ${prsntAddress.postOfcEn}`.trim(),
        },
        {
          id: "prsntAddrBn",
          val: `${prsntAddress.vilAreaTownBn} ${prsntAddress.postOfc}`.trim(),
        }
      );
    }
    
    if (permAddress && permAddress.country !== "-1") {
      correctionInfoArray.push(
        {
          id: "permAddrLocationId",
          val: permAddress.paurasavaOrUnion.toString(),
        },
        {
          id: "permAddrWardInPaurasavaOrUnion",
          val: permAddress.ward.toString(),
        },
        {
          id: "permAddrEn",
          val: `${permAddress.vilAreaTownEn} ${permAddress.postOfcEn}`.trim(),
        },
        {
          id: "permAddrBn",
          val: `${permAddress.vilAreaTownBn} ${permAddress.postOfc}`.trim(),
        }
      );
    }

    // Prepare FormData
    const formData = new FormData();

    // Add CSRF token and basic identifiers
    formData.append("_csrf", body.csrf);
    formData.append("brSearchAliveBrnCorr", body.ubrn);
    formData.append("birthRegisterId", "");
    formData.append("brSearchDob", body.dob);
    formData.append("captchaAns", body.captcha);
    formData.append("otp", body.otp);

    // Add specific personal info corrections

    // Add correction information from correctionInfos
    body.correctionInfos.forEach((info) => {
      if (info.key && info.value) {
        formData.append(info.key, info.value);
        formData.append(`${info.key}_cause`, "2");
      }
    });

    // Add birth place address if provided
    if (birthPlace && birthPlace.country !== "-1") {
      formData.append("birthPlaceCorrectionCheckbox", "yes");
      formData.append("birthPlaceCountry", birthPlace.country);
      formData.append("birthPlaceDiv", birthPlace.division.toString());
      formData.append("birthPlaceDist", birthPlace.district.toString());
      formData.append(
        "birthPlaceCityCorpCantOrUpazila",
        birthPlace.cityCorpCantOrUpazila.toString()
      );
      formData.append(
        "birthPlacePaurasavaOrUnion",
        birthPlace.paurasavaOrUnion.toString()
      );
      formData.append("birthPlaceWardInCityCorp", "-1");
      formData.append("birthPlaceArea", "-1");
      formData.append(
        "birthPlaceWardInPaurasavaOrUnion",
        birthPlace.ward.toString()
      );

      // Add ALL birth place address fields
      formData.append("birthPlacePostOfc", birthPlace.postOfc || "");
      formData.append("birthPlacePostOfcEn", birthPlace.postOfcEn || "");
      formData.append(
        "birthPlaceVilAreaTownBn",
        birthPlace.vilAreaTownBn || ""
      );
      formData.append(
        "birthPlaceVilAreaTownEn",
        birthPlace.vilAreaTownEn || ""
      );
      formData.append("birthPlaceHouseRoadBn", birthPlace.houseRoadBn || "");
      formData.append("birthPlaceHouseRoadEn", birthPlace.houseRoadEn || "");
      formData.append("birthPlacePostCode", "");
      formData.append(
        "birthPlaceLocationId",
        birthPlace.geoId !== "0"
          ? birthPlace.geoId
          : birthPlace.paurasavaOrUnion.toString()
      );
      formData.append(
        "birthPlaceEn",
        `${birthPlace.vilAreaTownEn || ""} ${
          birthPlace.postOfcEn || ""
        }`.trim() || ""
      );
      formData.append(
        "birthPlaceBn",
        `${birthPlace.vilAreaTownBn || ""} ${
          birthPlace.postOfc || ""
        }`.trim() || ""
      );
    }

    // Handle Permanent Address - ALWAYS include it with proper data
    if (birthPlace && birthPlace.country !== "-1") {
      // Use birth place data for permanent address
      formData.append("permAddrCorrectionCheckbox", "yes");
      formData.append("permAddrCountry", birthPlace.country);
      formData.append("permAddrDiv", birthPlace.division.toString());
      formData.append("permAddrDist", birthPlace.district.toString());
      formData.append(
        "permAddrCityCorpCantOrUpazila",
        birthPlace.cityCorpCantOrUpazila.toString()
      );
      formData.append(
        "permAddrPaurasavaOrUnion",
        birthPlace.paurasavaOrUnion.toString()
      );
      formData.append("permAddrWardInCityCorp", "-1");
      formData.append("permAddrArea", "-1");
      formData.append(
        "permAddrWardInPaurasavaOrUnion",
        birthPlace.ward.toString()
      );

      // Add ALL permanent address fields
      formData.append("permAddrPostOfc", birthPlace.postOfc || "");
      formData.append("permAddrPostOfcEn", birthPlace.postOfcEn || "");
      formData.append("permAddrVilAreaTownBn", birthPlace.vilAreaTownBn || "");
      formData.append("permAddrVilAreaTownEn", birthPlace.vilAreaTownEn || "");
      formData.append("permAddrHouseRoadBn", birthPlace.houseRoadBn || "");
      formData.append("permAddrHouseRoadEn", birthPlace.houseRoadEn || "");
      formData.append("permAddrPostCode", "");
      formData.append(
        "permAddrLocationId",
        birthPlace.geoId !== "0"
          ? birthPlace.geoId
          : birthPlace.paurasavaOrUnion.toString()
      );
      formData.append(
        "permAddrEn",
        `${birthPlace.vilAreaTownEn || ""} ${
          birthPlace.postOfcEn || ""
        }`.trim() || ""
      );
      formData.append(
        "permAddrBn",
        `${birthPlace.vilAreaTownBn || ""} ${
          birthPlace.postOfc || ""
        }`.trim() || ""
      );
    }

    // Handle Present Address - ALWAYS include it with proper data
    if (birthPlace && birthPlace.country !== "-1") {
      // Use birth place data for present address
      formData.append("prsntAddrCorrectionCheckbox", "yes");
      formData.append("prsntAddrCountry", birthPlace.country);
      formData.append("prsntAddrDiv", birthPlace.division.toString());
      formData.append("prsntAddrDist", birthPlace.district.toString());
      formData.append(
        "prsntAddrCityCorpCantOrUpazila",
        birthPlace.cityCorpCantOrUpazila.toString()
      );
      formData.append(
        "prsntAddrPaurasavaOrUnion",
        birthPlace.paurasavaOrUnion.toString()
      );
      formData.append("prsntAddrWardInCityCorp", "-1");
      formData.append("prsntAddrArea", "-1");
      formData.append(
        "prsntAddrWardInPaurasavaOrUnion",
        birthPlace.ward.toString()
      );

      // Add ALL present address fields
      formData.append("prsntAddrPostOfc", birthPlace.postOfc || "");
      formData.append("prsntAddrPostOfcEn", birthPlace.postOfcEn || "");
      formData.append("prsntAddrVilAreaTownBn", birthPlace.vilAreaTownBn || "");
      formData.append("prsntAddrVilAreaTownEn", birthPlace.vilAreaTownEn || "");
      formData.append("prsntAddrHouseRoadBn", birthPlace.houseRoadBn || "");
      formData.append("prsntAddrHouseRoadEn", birthPlace.houseRoadEn || "");
      formData.append("prsntAddrPostCode", "");
      formData.append(
        "prsntAddrLocationId",
        birthPlace.geoId !== "0"
          ? birthPlace.geoId
          : birthPlace.paurasavaOrUnion.toString()
      );
      formData.append(
        "prsntAddrEn",
        `${birthPlace.vilAreaTownEn || ""} ${
          birthPlace.postOfcEn || ""
        }`.trim() || ""
      );
      formData.append(
        "prsntAddrBn",
        `${birthPlace.vilAreaTownBn || ""} ${
          birthPlace.postOfc || ""
        }`.trim() || ""
      );
    }
    formData.append(
      "copyBirthPlaceToPermAddr",
      body.isPermAddressIsSameAsBirthPlace ? "yes" : "no"
    );
    formData.append(
      "copyPermAddrToPrsntAddr",
      body.isPrsntAddressIsSameAsPermAddress ? "yes" : "no"
    );
    // Add files/attachments
    if (body.files && body.files.length > 0) {
      body.files.forEach((file) => {
        formData.append("attachments", file.id.toString());
      });
    }

    // Add applicant information
    formData.append(
      "relationWithApplicant",
      body.applicantInfo.relationWithApplicant || "SELF"
    );
    formData.append("applicantFatherBrn", "");
    formData.append("applicantFatherNid", "");
    formData.append("applicantMotherBrn", "");
    formData.append("applicantMotherNid", "");
    formData.append("applicantNotParentsBrn", "");
    formData.append("applicantNotParentsDob", "");
    formData.append("applicantNotParentsNid", "");
    formData.append("applicantName", body.applicantInfo.name);
    formData.append("email", body.applicantInfo.email || "");

    // Format phone number (similar to PHP logic)
    let phone = body.applicantInfo.phone;
    if (phone.length === 11 && phone.startsWith("01")) {
      phone = "+88" + phone;
    }
    formData.append("phone", phone);

    // Add the correction info JSON (important!)
    formData.append("correctionInfoJson", JSON.stringify(correctionInfoArray));

    // Prepare headers
    const userAgentString =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";

    const headers = new Headers();
    headers.set("User-Agent", userAgentString);

    if (body.cookies?.length) {
      headers.set("Cookie", body.cookies.join("; "));
    }

    headers.set("Accept", "*/*");
    headers.set("X-Requested-With", "XMLHttpRequest");
    headers.set("X-Csrf-Token", body.csrf);
    headers.set("Referer", "https://bdris.gov.bd/br/correction");
    // Make the request to the external API
    const apiUrl = "https://bdris.gov.bd/br/correction";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    // Use safe parsing to handle HTML responses
    const result = await safeParseResponse(response);

    if (!result.success) {
      currection.submit_status = "failed";
      await currection.save();
      return NextResponse.json(
        {
          success: false,
          error: result,
        },
        { status: 500 }
      );
    }
    currection.submit_status = "submitted";
    currection.applicationId = result.applicationId;
    currection.printLink = result.printLink;
    await currection.save();

    // Return the result from external API
    return NextResponse.json(currection);
  } catch (error) {
    console.error("Error processing birth registration correction:", error);

    // Return user-friendly error message
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error ||
          "আপনার আবেদনের সেশনের মেয়াদ শেষ অথবা নিবন্ধন সার্ভার সমস্যা। দয়া করে আবার চেষ্টা করুন।",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
      message: "GET method is not supported for this endpoint.",
    },
    { status: 405 }
  );
}
