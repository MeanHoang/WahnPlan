"use client";

import dynamic from "next/dynamic";
import { RichTextEditor } from "./rich-text-editor";

// Dynamically import RichTextEditor to avoid SSR issues
const DynamicRichTextEditor = dynamic(() => Promise.resolve(RichTextEditor), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  ),
});

export { DynamicRichTextEditor as RichTextEditor };
