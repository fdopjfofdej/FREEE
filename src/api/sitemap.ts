import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateSitemap() {
  try {
    const { data: cars, error } = await supabase
      .from("cars")
      .select("slug")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    const baseUrl = "https://freeauto.ch";

    const languages = [
      "fr",
      "de",
      "en"
    ]

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const language of languages) {
      xml += "  <url>\n";
      xml += "    <loc>" + baseUrl + "/" + language + "/</loc>\n";
      xml += "    <changefreq>daily</changefreq>\n";
      xml += "    <priority>1.0</priority>\n";
      xml += "  </url>\n";
    }

    if (cars) {
      for (const lang of languages) {
        for (const car of cars) {
          xml += "  <url>\n";
          xml += "    <loc>" + baseUrl + "/" + lang + "/ads/" + car.slug + "</loc>\n";
          xml += "    <changefreq>weekly</changefreq>\n";
          xml += "    <priority>0.8</priority>\n";
          xml += "  </url>\n";
        }
      }
    }

    xml += "</urlset>";

    const filePath = path.join(process.cwd(), "public", "sitemap.xml");
    fs.writeFileSync(filePath, xml);

    console.log(
      `Sitemap generated successfully with ${
        cars ? cars.length : 0
      } car listings`
    );
    return true;
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    return false;
  }
}

await generateSitemap();
process.exit(0);
