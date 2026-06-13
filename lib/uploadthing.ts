import { generateUploadButton } from "@uploadthing/react";
import type { OrbitFileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OrbitFileRouter>();
