export function formatTime(timestamp: Date) {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const getDayString = (timestamp: Date): string => {
  return timestamp.toISOString().split('T')[0]
}

export const getDayStringSafe = (dateString: string) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'Invalid date' : getDayString(date);
};

export const scrollToBottom = () => {
  const scrollableContainer = document.querySelector('.col.overflow-auto');
  if (scrollableContainer) {
    scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
  }
}
