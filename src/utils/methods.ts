const imitateMouseEvent = (element: Element, eventType: string, iClientX: number, iClientY: number) => {
  const event = new MouseEvent(eventType, {"clientX": iClientX, "clientY": iClientY});
  element.dispatchEvent(event);
}
function formatTime(value: number){
　　if (!value) return '00:00'　　　
　　let interval = Math.floor(value)
　　let minute = (Math.floor(interval / 60)).toString().padStart(2, '0')
　　let second = (interval % 60).toString().padStart(2, '0')
　　return `${minute}:${second}`
}
export { imitateMouseEvent, formatTime }