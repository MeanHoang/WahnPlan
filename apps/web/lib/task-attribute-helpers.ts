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
