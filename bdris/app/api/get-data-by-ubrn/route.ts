import { NextRequest, NextResponse } from "next/server";

const userAgentString =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";

export async function POST(req: NextRequest) {
  const { ubrn, dob, captcha, data } = await req.json();

  try {
    // Disable SSL verification (DEV only)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    console.info(`Request received for UBRN: ${ubrn}, DOB: ${dob}, Captcha: ${captcha}`);

    const url = `https://bdris.gov.bd/api/br/search-by-ubrn-and-dob?ubrn=${ubrn}&personBirthDate=${dob}&captchaAns=${captcha}`;

    // Build headers
    const headers = new Headers();
    headers.set("User-Agent", userAgentString);
    if (data?.cookies?.length) {
      headers.set("Cookie", data.cookies.join("; "));
    }
    headers.set("Accept", "*/*");
    headers.set("X-Requested-With", "XMLHttpRequest");
    headers.set("Referer", "https://bdris.gov.bd/br/correction");

    // Make the request
    const response = await fetch(url, { headers });
    if (!response.ok) {
      return NextResponse.json({ success: false, error: "Failed to fetch data" }, { status: 500 });
    }
    const jsonData = await response.json(); // JSON response
    console.log(JSON.stringify(jsonData))

    return NextResponse.json({ success: true, data: jsonData[0] });
  } catch (err) {
    console.error("BDRIS request error:", err);
    return NextResponse.json({ success: false, error: err || "Server error" }, { status: 500 });
  }
}
