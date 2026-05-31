"use client";

import { useEffect } from "react";

export function CandidateLogger() {
  useEffect(() => {
    // Mandatory candidate verification console logging rule
    console.log("[NextFlow] Candidate LinkedIn: https://www.linkedin.com/in/sauhard-iaoc");
  }, []);

  return null;
}
