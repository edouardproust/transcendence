import React from "react";
import { pushToast } from "@/components/ui/ToastProvider";

export const WaitingBanner: React.FC = () => (
  <div className="mb-4 p-4 bg-yellow-50 dark:bg-gray-800 border border-yellow-200 rounded text-center">
    <p className="text-yellow-800 font-medium mb-2">
      ⏳ Esperando que se una un oponente...
    </p>
    <p className="text-sm text-gray-600">Comparte este link con tu oponente:</p>
    <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
      <code className="text-sm">{window.location.href}</code>
    </div>
    <button
      onClick={() => {
        navigator.clipboard.writeText(window.location.href);
        pushToast("Link copiado", "success");
      }}
      className="mt-2 text-sm text-blue-600 hover:underline"
    >
      📋 Copiar link
    </button>
  </div>
);