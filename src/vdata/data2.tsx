import { IMoveData } from '../vdata/data1'

interface IEventData {
  type: 'mouse-event' | 'key-event',
  time: number,
}

export interface IMouseEventData extends IEventData {
  x: number,
  y: number,
  event: string,
  element: string
}

export interface IKeyEventData extends IEventData {
  value: string
}

const data: Array<IMouseEventData | IMoveData> = [
  { type: 'move', time: 0, x: 100, y: 100 },
  { type: 'move', time: 1, x: 110, y: 100 },
  { type: 'move', time: 2, x: 110, y: 110 },
  { type: 'move', time: 3, x: 110, y: 120 },
  { type: 'move', time: 4, x: 120, y: 120 },
  { type: 'move', time: 5, x: 130, y: 120 },
  { type: 'move', time: 6, x: 130, y: 130 },
  { type: 'move', time: 7, x: 130, y: 140 },
  { type: 'move', time: 8, x: 140, y: 140 },
  { type: 'move', time: 9, x: 150, y: 140 },
  { type: 'move', time: 10, x: 30, y: 20 },
  { type: 'mouse-event', time: 11, x: 30, y: 20, element: 'a[title="home"]', event: 'click' }
]

const dataKey: Array<IKeyEventData> = [
  { type: 'key-event', time: 0, value: '' }
]

export default data