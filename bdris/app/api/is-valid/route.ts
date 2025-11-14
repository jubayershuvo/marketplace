// app/api/birth-registration/correction/route.ts
import { connectDB } from "@/lib/mongodb";
import Raw from "@/models/Raw";
import { NextRequest, NextResponse } from "next/server";

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
  isPrsntAddressIsSameAsBirthPlace: boolean;
}

// Helper function to check if string is HTML
function isHTML(str: string): boolean {
  return str.trim().startsWith("<!DOCTYPE") || str.trim().startsWith("<html");
}

// Helper function to parse response safely
async function safeParseResponse(response: Response) {
  const text = await response.text();

  if (isHTML(text)) {
    console.error(
      "Received HTML response instead of JSON:",
      text.substring(0, 500)
    );

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
    const raw = await Raw.create({ raw: JSON.stringify(body) });
    console.log(raw._id)

    // Validate required fields
    if (
      !body.ubrn ||
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

    // Prepare FormData
    const formData = new FormData();

    // Add CSRF token and basic identifiers
    formData.append("_csrf", body.csrf);
    formData.append("brSearchAliveBrnCorr", body.ubrn);
    formData.append("birthRegisterId", "");
    formData.append("brSearchDob", body.dob);
    formData.append("captchaAns", body.captcha);

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
      formData.append("birthPlacePostOfc", birthPlace.postOfc);
      formData.append("birthPlacePostOfcEn", birthPlace.postOfcEn);
      formData.append("birthPlaceVilAreaTownBn", birthPlace.vilAreaTownBn);
      formData.append("birthPlaceVilAreaTownEn", birthPlace.vilAreaTownEn);
      formData.append("birthPlaceHouseRoadBn", birthPlace.houseRoadBn);
      formData.append("birthPlaceHouseRoadEn", birthPlace.houseRoadEn);
      formData.append("birthPlacePostCode", "");
      formData.append(
        "birthPlaceLocationId",
        birthPlace.paurasavaOrUnion.toString()
      );
      formData.append(
        "birthPlaceEn",
        `${birthPlace.vilAreaTownEn} ${birthPlace.postOfcEn}`.trim()
      );
      formData.append(
        "birthPlaceBn",
        `${birthPlace.vilAreaTownBn} ${birthPlace.postOfc}`.trim()
      );
    }

    // Add permanent address if different from birth place
    if (
      !body.isPermAddressIsSameAsBirthPlace &&
      permAddress &&
      permAddress.country !== "-1"
    ) {
      formData.append("permAddrCountry", permAddress.country);
      formData.append("permAddrDiv", permAddress.division.toString());
      formData.append("permAddrDist", permAddress.district.toString());
      formData.append(
        "permAddrCityCorpCantOrUpazila",
        permAddress.cityCorpCantOrUpazila.toString()
      );
      formData.append(
        "permAddrPaurasavaOrUnion",
        permAddress.paurasavaOrUnion.toString()
      );
      formData.append("permAddrWardInCityCorp", "-1");
      formData.append("permAddrArea", "-1");
      formData.append(
        "permAddrWardInPaurasavaOrUnion",
        permAddress.ward.toString()
      );
      formData.append("permAddrPostOfc", permAddress.postOfc);
      formData.append("permAddrPostOfcEn", permAddress.postOfcEn);
      formData.append("permAddrVilAreaTownBn", permAddress.vilAreaTownBn);
      formData.append("permAddrVilAreaTownEn", permAddress.vilAreaTownEn);
      formData.append("permAddrHouseRoadBn", permAddress.houseRoadBn);
      formData.append("permAddrHouseRoadEn", permAddress.houseRoadEn);
      formData.append("permAddrPostCode", "");
      formData.append("permAddrLocationId", permAddress.geoId || "");
      formData.append(
        "permAddrEn",
        `${permAddress.vilAreaTownEn} ${permAddress.postOfcEn}`.trim()
      );
      formData.append(
        "permAddrBn",
        `${permAddress.vilAreaTownBn} ${permAddress.postOfc}`.trim()
      );
    } else {
      // Set default values for permanent address
      const permFields = [
        "Country",
        "Div",
        "Dist",
        "CityCorpCantOrUpazila",
        "PaurasavaOrUnion",
        "WardInCityCorp",
        "Area",
        "WardInPaurasavaOrUnion",
        "PostOfc",
        "PostOfcEn",
        "VilAreaTownBn",
        "VilAreaTownEn",
        "HouseRoadBn",
        "HouseRoadEn",
        "PostCode",
        "LocationId",
        "En",
        "Bn",
      ];
      permFields.forEach((field) => {
        formData.append(`permAddr${field}`, field === "Country" ? "-1" : "");
      });
    }

    // Add present address if different from birth place
    if (
      !body.isPrsntAddressIsSameAsBirthPlace &&
      prsntAddress &&
      prsntAddress.country !== "-1"
    ) {
      formData.append("prsntAddrCountry", prsntAddress.country);
      formData.append("prsntAddrDiv", prsntAddress.division.toString());
      formData.append("prsntAddrDist", prsntAddress.district.toString());
      formData.append(
        "prsntAddrCityCorpCantOrUpazila",
        prsntAddress.cityCorpCantOrUpazila.toString()
      );
      formData.append(
        "prsntAddrPaurasavaOrUnion",
        prsntAddress.paurasavaOrUnion.toString()
      );
      formData.append("prsntAddrWardInCityCorp", "-1");
      formData.append("prsntAddrArea", "-1");
      formData.append(
        "prsntAddrWardInPaurasavaOrUnion",
        prsntAddress.ward.toString()
      );
      formData.append("prsntAddrPostOfc", prsntAddress.postOfc);
      formData.append("prsntAddrPostOfcEn", prsntAddress.postOfcEn);
      formData.append("prsntAddrVilAreaTownBn", prsntAddress.vilAreaTownBn);
      formData.append("prsntAddrVilAreaTownEn", prsntAddress.vilAreaTownEn);
      formData.append("prsntAddrHouseRoadBn", prsntAddress.houseRoadBn);
      formData.append("prsntAddrHouseRoadEn", prsntAddress.houseRoadEn);
      formData.append("prsntAddrPostCode", "");
      formData.append("prsntAddrLocationId", prsntAddress.geoId || "");
      formData.append(
        "prsntAddrEn",
        `${prsntAddress.vilAreaTownEn} ${prsntAddress.postOfcEn}`.trim()
      );
      formData.append(
        "prsntAddrBn",
        `${prsntAddress.vilAreaTownBn} ${prsntAddress.postOfc}`.trim()
      );
    } else {
      // Set default values for present address
      const prsntFields = [
        "Country",
        "Div",
        "Dist",
        "CityCorpCantOrUpazila",
        "PaurasavaOrUnion",
        "WardInCityCorp",
        "Area",
        "WardInPaurasavaOrUnion",
        "PostOfc",
        "PostOfcEn",
        "VilAreaTownBn",
        "VilAreaTownEn",
        "HouseRoadBn",
        "HouseRoadEn",
        "PostCode",
        "LocationId",
        "En",
        "Bn",
      ];
      prsntFields.forEach((field) => {
        formData.append(`prsntAddr${field}`, field === "Country" ? "-1" : "");
      });
    }

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

    console.log("Full form data:", Object.fromEntries(formData));

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
    const apiUrl = "https://bdris.gov.bd/api/br/correction/is-valid-app";

    console.log(
      "Making request to external API with cookies:",
      body.cookies?.length ? "Present" : "Missing"
    );

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    // Use safe parsing to handle HTML responses
    const result = await safeParseResponse(response);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result,
        },
        { status: 500 }
      );
    }

    // Return the result from external API
    return NextResponse.json(result);
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
