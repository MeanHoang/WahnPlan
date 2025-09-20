import { TaskStatus, TaskPriority, TaskInitiative } from "@/types/task";

/**
 * Get style object for task priority with hex color from API
 */
export const getPriorityStyle = (priority?: TaskPriority) => {
  if (!priority) return { backgroundColor: "#f3f4f6", color: "#1f2937" };

  // Use hex color directly from API response
  const hexColor = priority.color;

  // Ensure hex color is valid
  if (!hexColor || !hexColor.startsWith("#")) {
    return { backgroundColor: "#f3f4f6", color: "#1f2937" };
  }

  const backgroundColor = hexColor + "40"; // Add 40% opacity
  const textColor = "#1f2937"; // Always black text

  return {
    backgroundColor,
    color: textColor,
  };
};

/**
 * Get style object for task status with hex color from API
 */
export const getStatusStyle = (status?: TaskStatus) => {
  if (!status) return { backgroundColor: "#f3f4f6", color: "#1f2937" };

  // Use hex color directly from API response
  const hexColor = status.color;

  // Ensure hex color is valid
  if (!hexColor || !hexColor.startsWith("#")) {
    return { backgroundColor: "#f3f4f6", color: "#1f2937" };
  }

  const backgroundColor = hexColor + "40"; // Add 40% opacity
  const textColor = "#1f2937"; // Always black text

  return {
    backgroundColor,
    color: textColor,
  };
};

/**
 * Get style object for task initiative with hex color from API
 */
export const getInitiativeStyle = (initiative?: TaskInitiative) => {
  if (!initiative) return { backgroundColor: "#f3f4f6", color: "#1f2937" };

  // Use hex color directly from API response
  const hexColor = initiative.color;

  // Ensure hex color is valid
  if (!hexColor || !hexColor.startsWith("#")) {
    return { backgroundColor: "#f3f4f6", color: "#1f2937" };
  }

  const backgroundColor = hexColor + "40"; // Add 40% opacity
  const textColor = "#1f2937"; // Always black text

  return {
    backgroundColor,
    color: textColor,
  };
};

/**
 * Get style object for status dot with hex color from API
 */
export const getStatusDotStyle = (status?: TaskStatus) => {
  if (!status) return { backgroundColor: "#6b7280" };

  // Use hex color directly from API response for status dot
  const hexColor = status.color;

  // Ensure hex color is valid
  if (!hexColor || !hexColor.startsWith("#")) {
    return { backgroundColor: "#6b7280" };
  }

  return { backgroundColor: hexColor };
};

/**
 * Get CSS classes for task attribute badges
 */
export const getTaskAttributeClasses = () => {
  return "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap";
};

/**
 * Get CSS classes for status dot
 */
export const getStatusDotClasses = () => {
  return "w-2 h-2 rounded-full mr-2";
};

/**
 * Determine the due date status of a task
 */
export const getDueDateStatus = (dueDate?: Date | string) => {
  if (!dueDate) return "normal";

  const due = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDateOnly = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  );

  // Calculate difference in days
  const diffTime = dueDateOnly.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "overdue";
  } else if (diffDays <= 3) {
    return "due-soon";
  } else {
    return "normal";
  }
};

/**
 * Get background color classes for task based on due date status
 */
export const getDueDateBackgroundClasses = (dueDate?: Date | string) => {
  const status = getDueDateStatus(dueDate);

  switch (status) {
    case "overdue":
      return "bg-red-50 border-red-200 hover:bg-red-100";
    case "due-soon":
      return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
    default:
      return "bg-white border-gray-200 hover:bg-gray-50";
  }
};

/**
 * Get background color classes for table row based on due date status
 */
export const getDueDateTableRowClasses = (dueDate?: Date | string) => {
  const status = getDueDateStatus(dueDate);

  switch (status) {
    case "overdue":
      return "bg-red-50 hover:bg-red-100";
    case "due-soon":
      return "bg-yellow-50 hover:bg-yellow-100";
    default:
      return "hover:bg-gray-50";
  }
};
