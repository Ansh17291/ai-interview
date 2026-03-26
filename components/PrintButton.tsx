"use client";

import { Printer } from "lucide-react";
import { Button } from "./ui/button";

export default function PrintButton() {
  return (
    <Button 
      onClick={() => window.print()} 
      className="flex-1 border border-primary-200/50 bg-transparent hover:bg-primary-200/10 text-primary-200 transition-colors"
    >
      <Printer className="w-4 h-4 mr-2" /> Download PDF Report
    </Button>
  );
}
