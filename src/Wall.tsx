import { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react'
import type { Params, Subject } from './types'
import './wall.css'

interface GridItemState {
  key: number;
  front: Subject | null;
  back: Subject | null;
  isFlipped: boolean;
  isTransitioning: boolean;
}

const TARGET_ITEM_HEIGHT = 240
const ASPECT_RATIO = 2 / 3
const ANIMATION_DURATION = 800
const ANIMATION_INTERVAL = 3000
const PADDING = 6

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function Wall({ subjects, params }: { subjects: Subject[], params?: Params }) {
  const [grids, setGrids] = useState<GridItemState[]>([])
  const [cols, setCols] = useState(0)
  const [rows, setRows] = useState(0)

  const aspectRatio = useMemo(() => params?.aspectRatio ?? ASPECT_RATIO, [params?.aspectRatio])
  const padding = useMemo(() => params?.padding ?? PADDING, [params?.padding])

  const animationTimer = useRef<number | null>(null)
  const lastAnimatedIndex = useRef<number | null>(null)
  const availableSubjects = useRef<Map<Subject['id'], Subject>>(new Map())

  useLayoutEffect(() => {
    const calculateLayout = () => {
      const vh = window.innerHeight - (2 * padding)
      const vw = window.innerWidth - (2 * padding)

      let newRows = 1

      if (params?.rows) {
        newRows = Math.max(1, params.rows)
      } else {
        const idealRows = Math.round((vh + padding) / (TARGET_ITEM_HEIGHT + padding))
        newRows = Math.max(1, idealRows)
      }

      const itemHeight = Math.floor((vh - padding * (newRows - 1)) / newRows)
      const itemWidth = Math.floor(itemHeight * (aspectRatio))

      const newCols = Math.floor(vw / itemWidth) + 1

      setCols(newCols)
      setRows(newRows)
    }

    calculateLayout()

    window.addEventListener('resize', calculateLayout)
    return () => window.removeEventListener('resize', calculateLayout)
  }, [params?.rows, padding, aspectRatio])

  useEffect(() => {
    if (subjects.length === 0 || cols <= 0 || rows <= 0) return

    const gridCount = cols * rows

    if (subjects.length < gridCount + 1) {
      console.warn('Warning: Not enough subjects to sustain animation without repeating visible items.')
    }

    const shuffledSubjects = shuffle(subjects)

    const frontSubjects = shuffledSubjects.slice(0, gridCount)

    availableSubjects.current = new Map(shuffledSubjects.slice(gridCount).map(s => [s.id, s]))

    const newGrids = Array.from({ length: gridCount }).map((_, i) => ({
      key: i,
      front: frontSubjects[i] ?? null,
      back: null,
      isFlipped: false,
      isTransitioning: false,
    }))

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGrids(newGrids)
  }, [subjects, cols, rows])

  const stopAnimation = useCallback(() => {
    if (animationTimer.current) {
      clearInterval(animationTimer.current)
      animationTimer.current = null
    }
  }, [])

  const startAnimation = useCallback(() => {
    stopAnimation()

    animationTimer.current = setInterval(() => {
      if (grids.length === 0) return

      if (availableSubjects.current.size === 0) {
        console.warn('Animation stopped: No available unique subjects to flip.')
        stopAnimation()
        return
      }

      let randomIndex

      do {
        randomIndex = Math.floor(Math.random() * grids.length)
      } while (randomIndex === lastAnimatedIndex.current)

      lastAnimatedIndex.current = randomIndex

      const newSubject = availableSubjects.current.values().next().value

      if (!newSubject) return

      setGrids(prev => {
        const newGrids = [...prev]
        const itemToFlip = newGrids[randomIndex]

        if (!itemToFlip) return prev

        const subjectToReplace = itemToFlip.isFlipped ? itemToFlip.back : itemToFlip.front

        if (subjectToReplace) {
          availableSubjects.current.set(subjectToReplace.id, subjectToReplace)
        }

        availableSubjects.current.delete(newSubject.id)

        newGrids[randomIndex] = {
          ...itemToFlip,
          front: itemToFlip.isFlipped ? newSubject : itemToFlip.front,
          back: !itemToFlip.isFlipped ? newSubject : itemToFlip.back,
          isFlipped: !itemToFlip.isFlipped,
          isTransitioning: true,
        }

        return newGrids
      })

      setTimeout(() => {
        requestAnimationFrame(() => {
          setGrids(prev => prev.map((item, index) =>
            index === randomIndex
              ? { ...item, isTransitioning: false }
              : item
          ))
        })
      }, ANIMATION_DURATION)

    }, ANIMATION_INTERVAL + Math.random() * 500)
  }, [grids, stopAnimation])

  useEffect(() => {
    if (document.visibilityState === 'visible') {
      startAnimation()
    }
    const handleVisibilityChange = () =>
      document.hidden ? stopAnimation() : startAnimation()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      stopAnimation()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [startAnimation, stopAnimation])

  if (grids.length === 0) return null

  return (
    <div className="wall">
      <div
        className="grids"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: `${padding}px`,
          padding: `${padding}px`,
          height: `calc(100dvh - ${2 * padding}px)`
        }}
      >
        {grids.map((item) => <GridItem key={item.key} item={item} aspectRatio={aspectRatio} />)}
      </div>
    </div>
  )
}

const GridItem = ({ item, aspectRatio }: { item: GridItemState, aspectRatio: number }) => {
  return (
    <div
      key={item.key}
      className={
        [
          'flipper',
          item.isFlipped ? 'is-flipped' : '',
          item.isTransitioning ? 'is-transitioning' : '',
        ].join(' ')
      }
      style={{ aspectRatio }}
    >
      <div className="front">
        {item.front && <img src={item.front.images.common} alt="cover" draggable="false" />}
      </div>
      <div className="back">
        {item.back && <img src={item.back.images.common} alt="cover" draggable="false" />}
      </div>
    </div>
  )
}
