import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

// ✅ correct worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const readPDF = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => (item as any).str).join(" ");
  }

  return text;
};