import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check je inbox</h1>
        <p className="text-gray-500 mb-6">
          We hebben een login link naar je email gestuurd. Klik op de link om in te loggen.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Geen email ontvangen? Check je spam folder.
          </p>
          <Link
            href="/login"
            className="inline-block text-sm text-blue-600 font-medium hover:underline"
          >
            Terug naar inloggen
          </Link>
        </div>
      </div>
    </div>
  );
}
