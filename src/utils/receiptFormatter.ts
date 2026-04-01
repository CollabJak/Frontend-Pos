export const formatLine = (left: string, right: string, width = 32): string => {
  const safeWidth = Math.max(8, Math.floor(width));
  const leftText = (left ?? "").replace(/\s+/g, " ").trim();
  const rightText = (right ?? "").replace(/\s+/g, " ").trim();

  if (rightText.length >= safeWidth) {
    return rightText.slice(0, safeWidth);
  }

  const minGap = 1;
  const maxLeftLength = Math.max(0, safeWidth - rightText.length - minGap);
  const clippedLeft =
    leftText.length <= maxLeftLength
      ? leftText
      : maxLeftLength <= 3
      ? leftText.slice(0, maxLeftLength)
      : `${leftText.slice(0, maxLeftLength - 3)}...`;

  const spaces = Math.max(minGap, safeWidth - clippedLeft.length - rightText.length);

  return `${clippedLeft}${" ".repeat(spaces)}${rightText}`;
};
