// app/api/birth-registration-correction/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data
    const incomingFormData = await request.formData()
    
    // Get cookies from the incoming request
    const cookies = request.headers.get('cookie') || ''

    // Create a new FormData for the external API
    const externalFormData = new FormData()

    // Dynamically copy all fields from incoming form data to external form data
    for (const [key, value] of incomingFormData.entries()) {
      if (value instanceof File) {
        // Handle file uploads
        externalFormData.append(key, value)
      } else {
        // Handle string values
        externalFormData.append(key, value as string)
      }
    }

    // Make the request to the external API
    const response = await fetch('https://bdris.gov.bd/br/correction', {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryxqvZnJBActdCYtAk',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0',
        'Origin': 'https://bdris.gov.bd',
        'Referer': 'https://bdris.gov.bd/br/correction',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Upgrade-Insecure-Requests': '1'
      },
      body: externalFormData,
      redirect: 'manual'
    })

    // Get the response data
    const responseText = await response.text()
    const responseCookies = response.headers.get('set-cookie')

    // Prepare the response headers
    const headers = new Headers()
    headers.set('Content-Type', 'text/html')
    
    if (responseCookies) {
      headers.set('Set-Cookie', responseCookies)
    }

    // Return the response from the external API
    return new NextResponse(responseText, {
      status: response.status,
      statusText: response.statusText,
      headers
    })

  } catch (error) {
    console.error('Proxy route error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process birth registration correction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Birth registration correction proxy API',
    usage: 'Send POST request with form data to submit correction',
    supportedFields: getAllSupportedFields()
  })
}

// Helper function to get all supported fields
function getAllSupportedFields() {
  return {
    required: [
      '_csrf',
      'brSearchAliveBrnCorr',
      'brSearchDob',
      'captchaAns',
      'personFirstNameBn',
      'personFirstNameEn',
      'phone',
      'otp',
      'applicantName',
      'relationWithApplicant'
    ],
    optional: [
      'birthRegisterId',
      'personFirstNameBn_cause',
      'personFirstNameEn_cause',
      'correctionInfoJson',
      'birthPlaceCountry',
      'birthPlaceDiv',
      'birthPlaceDist',
      'birthPlaceCityCorpCantOrUpazila',
      'birthPlacePaurasavaOrUnion',
      'birthPlaceWardInCityCorp',
      'birthPlaceArea',
      'birthPlaceWardInPaurasavaOrUnion',
      'birthPlacePostOfc',
      'birthPlacePostOfcEn',
      'birthPlaceVilAreaTownBn',
      'birthPlaceVilAreaTownEn',
      'birthPlaceHouseRoadBn',
      'birthPlaceHouseRoadEn',
      'birthPlacePostCode',
      'birthPlaceLocationId',
      'birthPlaceEn',
      'birthPlaceBn',
      'permAddrCountry',
      'permAddrDiv',
      'permAddrDist',
      'permAddrCityCorpCantOrUpazila',
      'permAddrPaurasavaOrUnion',
      'permAddrWardInCityCorp',
      'permAddrArea',
      'permAddrWardInPaurasavaOrUnion',
      'permAddrPostOfc',
      'permAddrPostOfcEn',
      'permAddrVilAreaTownBn',
      'permAddrVilAreaTownEn',
      'permAddrHouseRoadBn',
      'permAddrHouseRoadEn',
      'permAddrPostCode',
      'permAddrLocationId',
      'permAddrEn',
      'permAddrBn',
      'prsntAddrCountry',
      'prsntAddrDiv',
      'prsntAddrDist',
      'prsntAddrCityCorpCantOrUpazila',
      'prsntAddrPaurasavaOrUnion',
      'prsntAddrWardInCityCorp',
      'prsntAddrArea',
      'prsntAddrWardInPaurasavaOrUnion',
      'prsntAddrPostOfc',
      'prsntAddrPostOfcEn',
      'prsntAddrVilAreaTownBn',
      'prsntAddrVilAreaTownEn',
      'prsntAddrHouseRoadBn',
      'prsntAddrHouseRoadEn',
      'prsntAddrPostCode',
      'prsntAddrLocationId',
      'prsntAddrEn',
      'prsntAddrBn',
      'files',
      'attachments',
      'applicantFatherBrn',
      'applicantFatherNid',
      'applicantMotherBrn',
      'applicantMotherNid',
      'applicantNotParentsBrn',
      'applicantNotParentsDob',
      'applicantNotParentsNid',
      'email'
    ]
  }
}