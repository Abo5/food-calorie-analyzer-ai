import { randomBytes, randomUUID } from "crypto"
import { gunzipSync } from "zlib"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/food
 * Form‑Data: { file: File }
 * Returns: { ok: true, data: { filename, nutrition } } | { ok: false, error }
 */
export async function POST(req: NextRequest) {
  try {
    // 1) استخرج الملف من multipart form
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 })
    }

    // 2) حوِّل لـ Buffer + tail عشوائي لتغيير الـhash
    const buf = Buffer.from(await file.arrayBuffer())
    const tail = randomBytes(20).toString("hex")
    const bytes = Buffer.concat([buf, Buffer.from(tail)])

    // دالة callGr8 للمساعدة
    async function callGr8(endpoint: string, body: Buffer | string, headers: Record<string, string>, extraQuery?: Record<string, string>) {
      const url = new URL(endpoint)
      const baseParams = {
        app_package:      "net.appedietInformation.appediet@1.36.52504031126",
        appstore_country: "SAU",
        country:          "us",
        device_id:        "8e172e2130acd995bb17d2e21a842fdc",
        language:         "ar-ar",
        machine_datetime: new Date().toISOString().slice(0, 10),
        os_version:       "18.3.1",
        platform:         "iOS",
        request_id:       randomUUID(),
        seconds_from_gmt: "10800",
        time_zone:        "3",
      }
      // إذا عندنا أي إضافات مثل filename نمررها
      const finalParams = { ...baseParams, ...extraQuery } // ← ندمجها
      url.search = new URLSearchParams(finalParams).toString()

      const res = await fetch(url.toString(), { method: "POST", headers, body })
      if (!res.ok) {
        const txt = await res.text()
        console.error("GR8 ERROR:", res.status, txt.slice(0, 300))
        throw new Error(`gr8api ${res.status}`)
      }

      const buff = Buffer.from(await res.arrayBuffer())
      const isGzip = buff[0] === 0x1f && buff[1] === 0x8b
      const raw = isGzip ? gunzipSync(buff) : buff
      return JSON.parse(raw.toString())
    }

    // 3) رفع الصورة
    // اكتشفنا أنه أحيانًا لا يأتي file.type صحيحًا إن كان غير مدعوم مثل camera/photo
    const contentType = file.type && file.type.startsWith("image/") ? file.type : "image/jpeg"

    const uploadRes = await callGr8(
      "https://api.gr8api.com/v1/file/public/upload",
      bytes,
      {
        "Content-Type":     contentType,
        "Accept":           "*/*",
        "Accept-Encoding":  "gzip, deflate, br",
        "User-Agent":       "NutriScan/1.0 (Next.js)",
        "Accept-Language":  "ar-US;q=1.0, en-US;q=0.9"
      }
    )

    const filename = uploadRes?.data?.filename
    if (!filename) throw new Error("Upload failed (no filename)")

    // 4) تحليل الطعام مع تمرير filename في query:
    const nutrition = await callGr8(
      "https://api.gr8api.com/v1/algorithm/food_recognition_v3",
      "{}", // body فارغ
      {
        "Content-Type":     "application/json",
        "Accept":           "*/*",
        "Accept-Encoding":  "gzip, deflate, br",
        "User-Agent":       "Appediet/1.36.5 (net.appedietInformation.appediet; build:1.36.52504031126; iOS 18.3.1) Alamofire/5.10.2",
        "Accept-Language":  "ar-US;q=1.0, en-US;q=0.9"
      },
      { filename } // ← مهم
    )

    return NextResponse.json({ ok: true, data: { filename, nutrition } })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
