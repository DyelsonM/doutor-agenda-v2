"use client";

import { Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Button } from "./button";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          onChange(result.url);
          toast.success("Imagem enviada com sucesso!");
        } else {
          toast.error(result.error || "Erro ao enviar imagem");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Erro ao enviar imagem");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: disabled || isUploading,
  });

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className={className}>
      {value ? (
        <div className="relative">
          <div className="border-border relative h-32 w-32 overflow-hidden rounded-lg border">
            <img
              src={value}
              alt="Logo da clínica"
              className="h-full w-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeImage}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-border cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${isDragActive ? "border-primary bg-primary/5" : ""} ${disabled || isUploading ? "cursor-not-allowed opacity-50" : "hover:border-primary/50"} `}
        >
          <input {...getInputProps()} />
          <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isUploading ? "Enviando..." : "Clique ou arraste uma imagem"}
            </p>
            <p className="text-muted-foreground text-xs">
              PNG, JPG, WebP até 5MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
