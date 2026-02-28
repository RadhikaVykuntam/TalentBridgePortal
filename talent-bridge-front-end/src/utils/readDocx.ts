import mammoth from "mammoth";

export const readDocx = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
};