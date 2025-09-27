// app/components/PersonaVerification.tsx
"use client";

import { useEffect } from "react";

interface PersonaVerificationProps {
  clientToken: string;
}

export default function PersonaVerification({ clientToken }: PersonaVerificationProps) {
  useEffect(() => {
    if (!clientToken || !(window as any).Persona) return;

    const inquiry = new (window as any).Persona.Client({
      environment: "sandbox", // change to "production" later
      clientToken,
      onReady: () => {
        console.log("Persona widget ready");
      },
      onComplete: ({ inquiryId, status }: any) => {
        console.log("Persona flow completed:", inquiryId, status);
        // No DB update yet — wait for backend webhook confirmation
      },
      onCancel: () => {
        console.log("User canceled Persona flow");
      },
      onError: (err: any) => {
        console.error("Persona error", err);
      },
    });

    inquiry.open();

    return () => inquiry.destroy();
  }, [clientToken]);

  return null;
}
