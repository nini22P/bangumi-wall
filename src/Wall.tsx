import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import type { Subject } from './types';
import './wall.css';

interface GridItemState {
  key: number;
  front: Subject;
  back?: Subject;
  isFlipped: boolean;
  isTransitioning: boolean;
}

const TARGET_ITEM_HEIGHT = 240;
const ASPECT_RATIO = 2 / 3;
const ANIMATION_DURATION = 800;
const ANIMATION_INTERVAL = 3000;
const PADDING = 6;

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function Wall({ subjects }: { subjects: Subject[] }) {
  const [grids, setGrids] = useState<GridItemState[]>([]);
  const [cols, setCols] = useState(0);
  const [rows, setRows] = useState(0);

  const animationTimer = useRef<number | null>(null);
  const lastAnimatedIndex = useRef<number | null>(null);
  const availableSubjectsRef = useRef<Subject[]>([]);

  useLayoutEffect(() => {
    const calculateLayout = () => {
      const vh = window.innerHeight - (2 * PADDING);
      const vw = window.innerWidth - (2 * PADDING);

      const idealRows = Math.round((vh + PADDING) / (TARGET_ITEM_HEIGHT + PADDING));
      const newRows = Math.max(1, idealRows);

      const itemHeight = Math.floor((vh - PADDING * (newRows - 1)) / newRows);
      const itemWidth = Math.floor(itemHeight * ASPECT_RATIO);

      const maxCols = Math.floor(vw / itemWidth) + 1;

      setCols(maxCols);
      setRows(newRows);
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    return () => window.removeEventListener('resize', calculateLayout);
  }, []);

  useEffect(() => {
    if (subjects.length === 0 || cols === 0 || rows === 0) return;

    const gridCount = cols * rows;

    if (subjects.length < gridCount) {
      console.warn("Warning: Not enough subjects to fill the grid without duplicates.");
    }

    const shuffledSubjects = shuffle(subjects);

    const initialDisplaySubjects = shuffledSubjects.slice(0, gridCount);
    availableSubjectsRef.current = shuffledSubjects.slice(gridCount);

    const newGrids = initialDisplaySubjects.map((subject, i) => ({
      key: i,
      front: subject,
      isFlipped: false,
      isTransitioning: false,
    }));

    setGrids(newGrids);
  }, [subjects, cols, rows]);

  const stopAnimation = useCallback(() => {
    if (animationTimer.current) {
      clearInterval(animationTimer.current);
      animationTimer.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    stopAnimation();

    animationTimer.current = setInterval(() => {
      if (availableSubjectsRef.current.length === 0 || grids.length === 0) {
        return;
      }

      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * grids.length);
      } while (randomIndex === lastAnimatedIndex.current);
      lastAnimatedIndex.current = randomIndex;

      const newSubject = availableSubjectsRef.current.shift()!;
      const subjectToReplace = grids[randomIndex].front;
      availableSubjectsRef.current.push(subjectToReplace);

      setGrids(prev => prev.map((item, index) =>
        index === randomIndex
          ? { ...item, back: newSubject, isFlipped: true, isTransitioning: true }
          : item
      ));

      setTimeout(() => {
        setGrids(prev => prev.map((item, index) =>
          index === randomIndex
            ? { ...item, front: newSubject }
            : item
        ));
      }, ANIMATION_DURATION / 2);

      setTimeout(() => {
        requestAnimationFrame(() => {
          setGrids(prev => prev.map((item, index) =>
            index === randomIndex
              ? { ...item, isFlipped: false, isTransitioning: false }
              : item
          ));
        });
      }, ANIMATION_DURATION);

    }, ANIMATION_INTERVAL + Math.random() * 500);
  }, [grids, stopAnimation]);

  useEffect(() => {
    if (document.visibilityState === 'visible') {
      startAnimation();
    }
    const handleVisibilityChange = () =>
      document.hidden ? stopAnimation() : startAnimation();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      stopAnimation();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startAnimation, stopAnimation]);

  if (grids.length === 0) return null;

  return (
    <div className="wall">
      <div
        className="grids"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: `${PADDING}px`,
          padding: `${PADDING}px`,
          height: `calc(100dvh - ${2 * PADDING}px)`
        }}
      >
        {grids.map((item) => (
          <div
            key={item.key}
            className={`flipper ${item.isFlipped ? 'is-flipped' : ''} ${item.isTransitioning ? 'is-transitioning' : ''}`}
            style={{ aspectRatio: ASPECT_RATIO }}
          >
            <div className="front">
              <a href={`https://bgm.tv/subject/${item.front.id}`} target="_blank" rel="noopener noreferrer">
                <img src={item.front.images.common} alt="cover" loading="lazy" draggable="false" />
              </a>
            </div>
            <div className="back">
              {item.isTransitioning && item.back && (
                <a href={`https://bgm.tv/subject/${item.back.id}`} target="_blank" rel="noopener noreferrer">
                  <img src={item.back.images.common} alt="cover" loading="lazy" draggable="false" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}