import { z } from "zod";

export const exportDocumentSchema = z.object({
  documentId: z.string().uuid("ID do documento inválido"),
  format: z.enum(["pdf", "docx"], {
    errorMap: () => ({ message: "Formato deve ser PDF ou DOCX" }),
  }),
});
