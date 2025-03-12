import { supabase } from "@/lib/supabase";

export async function generateSitemap() {
  const { data: cars, error } = await supabase
    .from("cars")
    .select("slug, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching data for sitemap:", error);
    throw new Error("Failed to generate sitemap");
  }

  const languages = ["fr", "de", "en"];
  const today = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${languages
       .map(
         (lang) => `
     <url>
       <loc>https://freeauto.ch/${lang}</loc>
       <lastmod>${today}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     `
       )
       .join("")}
     


       ${(cars || [])
         .flatMap((car) => {
           return languages.map(
             (lang) => `
       <url>
           <loc>https://freeauto.ch/${lang}/ads/${car.slug}</loc>
           <lastmod>${new Date(car.created_at).toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
       `
           );
         })
         .join("")}
   </urlset>`;
}
