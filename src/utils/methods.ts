const imitateMouseEvent = (element: Element, eventType: string, iClientX: number, iClientY: number) => {
  const event = new MouseEvent(eventType, {"clientX": iClientX, "clientY": iClientY});
  element.dispatchEvent(event);
}

export { imitateMouseEvent }