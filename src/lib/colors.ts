
export function generateColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 45 + Math.floor(Math.random() * 25); // 45–70
  const lightness = 55 + Math.floor(Math.random() * 20);  // 55–75
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}