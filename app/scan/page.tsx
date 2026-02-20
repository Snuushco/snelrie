import { Suspense } from "react";
import ScanForm from "./scan-form";

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>}>
      <ScanForm />
    </Suspense>
  );
}
