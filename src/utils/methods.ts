const imitateMouseEvent = (element: HTMLElement, eventType: string) => {
  // const iClientX = element.offsetLeft + element.offsetWidth / 2;
  // const iClientY = element.offsetTop + element.offsetHeight / 2;
  // const event = new MouseEvent(eventType, {"clientX": iClientX, "clientY": iClientY});
  // element.dispatchEvent(event);
  switch (eventType) {
    case 'click': element.click()
  }
}
const getImitateElement = (target: HTMLElement | null): HTMLElement | null => {
  if (Object.is(target, null)) return null;
  const element = target as HTMLElement;
  if (element.getAttribute("data-imitate") === 'true') {
    return element;
  } else {
    return getImitateElement(element.parentElement);
  }
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
export { imitateMouseEvent, getImitateElement, formatTime, firstUpperCase }