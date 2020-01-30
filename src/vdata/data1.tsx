export interface IMoveData {
  type: 'move'
  time: number,
  x: number,
  y: number
}

const data: Array<IMoveData> = [
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
]

export default data