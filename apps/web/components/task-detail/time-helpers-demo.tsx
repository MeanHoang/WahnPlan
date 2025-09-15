"use client";

import {
  formatTime,
  formatRelativeTime,
  formatAbsoluteTime,
} from "@/lib/time-helpers";

// Demo component để test time helpers
export function TimeHelpersDemo() {
  const now = new Date();
  const testDates = [
    new Date(now.getTime() - 30 * 1000), // 30 seconds ago
    new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
    new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
    new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Time Helpers Demo</h1>
      <div className="space-y-4">
        {testDates.map((date, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 bg-gray-50 rounded"
          >
            <span className="text-sm text-gray-600">
              {date.toLocaleString()}
            </span>
            <div className="flex gap-4">
              <span className="text-sm font-medium">
                formatTime: {formatTime(date.toISOString())}
              </span>
              <span className="text-sm text-blue-600">
                formatRelativeTime: {formatRelativeTime(date.toISOString())}
              </span>
              <span className="text-sm text-green-600">
                formatAbsoluteTime: {formatAbsoluteTime(date.toISOString())}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
