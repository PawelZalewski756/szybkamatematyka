import fs from "node:fs";
import { CKE_EGZAMIN_8 } from "@/lib/trening/cke-egzamin-8";
import { CKE_MATURA_PODSTAWOWA } from "@/lib/trening/cke-matura-podstawowa";
const urls: string[] = [];
for (const tree of [CKE_EGZAMIN_8, CKE_MATURA_PODSTAWOWA] as const) {
  const exam = tree.examType === "8_klasa" ? "egzamin-osmoklasisty" : "matura";
  for (const category of tree.categories) {
    for (const topic of category.topics) {
      urls.push(`/trening/${exam}/${category.slug}/${topic.slug}`);
    }
  }
}
fs.writeFileSync("screenshots/topics.json", JSON.stringify(urls, null, 2));
console.log(urls.length);
