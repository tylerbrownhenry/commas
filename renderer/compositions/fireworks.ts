import { createIDGenerator } from '../utils/helper'

const generateID = createIDGenerator()

export interface Firework {
  id: number,
  position: {
    x: number,
    y: number,
  },
}

const fireworks = $ref<Firework[]>([])

export function useFireworks() {
  return $$(fireworks)
}

export function addFirework(position: Firework['position']) {
  fireworks.push({
    position,
    id: generateID(),
  })
}

export function removeFirework(target: Firework) {
  const targetIndex = fireworks.findIndex(item => item.id === target.id)
  if (targetIndex !== -1) {
    fireworks.splice(targetIndex, 1)
  }
}
