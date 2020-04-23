const imitateMouseEvent = (element: HTMLElement, eventType: string) => {
  const iClientX = element.offsetLeft + element.offsetWidth / 2;
  const iClientY = element.offsetTop + element.offsetHeight / 2;
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
function firstUpperCase(str: string) {
  return str.replace(/\b(\w)(\w*)/g, ($0, $1, $2) => {
    return $1.toUpperCase() + $2
  })
}
export { imitateMouseEvent, formatTime, firstUpperCase }