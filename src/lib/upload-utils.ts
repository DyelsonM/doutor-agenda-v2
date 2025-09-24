import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadFile(file: File, folder: string): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split(".").pop() || "bin";
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Retornar URL relativa
    return `/uploads/${folder}/${fileName}`;
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw new Error("Falha ao fazer upload do arquivo");
  }
}
