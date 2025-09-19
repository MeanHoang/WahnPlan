"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, User, X } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";

interface User {
  id: string;
  email: string;
  fullname?: string;
  publicName?: string;
  avatarUrl?: string;
}

interface UserSelectorProps {
  value: string | string[]; // Single ID for assignee/reviewer, array for members
  onChange: (value: string | string[]) => void;
  users: User[];
  placeholder?: string;
  multiple?: boolean;
  className?: string;
}

export function UserSelector({
  value,
  onChange,
  users,
  placeholder = "Select user",
  multiple = false,
  className = "",
}: UserSelectorProps): JSX.Element {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedUserIds = Array.isArray(value) ? value : value ? [value] : [];
  const selectedUsers = users.filter((user) =>
    selectedUserIds.includes(user.id)
  );

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const name = user.publicName || user.fullname || user.email;
    return name.toLowerCase().includes(searchLower);
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUserSelect = (userId: string) => {
    if (multiple) {
      const newValue = selectedUserIds.includes(userId)
        ? selectedUserIds.filter((id) => id !== userId)
        : [...selectedUserIds, userId];
      onChange(newValue);
    } else {
      onChange(userId);
      setIsOpen(false);
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (multiple) {
      const newValue = selectedUserIds.filter((id) => id !== userId);
      onChange(newValue);
    } else {
      onChange("");
    }
  };

  const getUserDisplayName = (user: User) => {
    return user.publicName || user.fullname || user.email;
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        className="w-64 px-2 py-1 text-xs text-left flex items-center justify-between bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1">
          {selectedUsers.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {selectedUsers.slice(0, multiple ? 2 : 1).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full text-xs"
                >
                  <div className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={getUserDisplayName(user)}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-2 w-2 text-blue-600" />
                    )}
                  </div>
                  <span className="text-blue-700">
                    {getUserDisplayName(user)}
                  </span>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUser(user.id);
                    }}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </div>
                </div>
              ))}
              {multiple && selectedUsers.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{selectedUsers.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t("userSelector.searchUsers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-8 pr-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className="w-64 px-2 py-1 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={getUserDisplayName(user)}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {getUserDisplayName(user)}
                    </div>
                  </div>
                  {selectedUserIds.includes(user.id) && (
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {t("userSelector.noUsersFound")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
