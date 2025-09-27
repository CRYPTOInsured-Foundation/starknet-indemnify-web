// app/kyc/page.tsx
"use client";

import { useState, useEffect } from "react";
import PersonaVerification from "@/components/providers/PersonaVerification";

export default function KycPage() {
  const [clientToken, setClientToken] = useState("");

  useEffect(() => {
    const startInquiry = async () => {
      const res = await fetch("http://localhost:5000/persona/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "uuid-from-db" }),
      });
      const data = await res.json();
      setClientToken(data.clientToken);
    };

    startInquiry();
  }, []);

  return (
    <div>
      <h1>KYC Verification</h1>
      {clientToken && <PersonaVerification clientToken={clientToken} />}
    </div>
  );
}
