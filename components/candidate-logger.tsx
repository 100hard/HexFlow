"use client";

import { useEffect } from "react";

export function CandidateLogger() {
  useEffect(() => {
    // Mandatory candidate verification console logging rule
    console.log("[NextFlow] Candidate LinkedIn: https://www.linkedin.com/in/sauhard-dubey-631a8b1b6/");
  }, []);

  return null;
}
