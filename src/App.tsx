import { useEffect, useState } from 'react'
import './App.css'
import type { Params, Subject } from './types'
import { getSubjects } from './api'
import Wall from './Wall'
import { useHash } from './hooks/useHash'

const defaultParams: Params = {
  username: 'sai',
  subjectType: 'all',
  collectionType: 'all',
  aspectRatio: 2 / 3,
}

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const params = useHash(defaultParams)

  useEffect(
    () => {
      (async () => {
        let subjects: Subject[] = []
        const data = await getSubjects(params, 50, 0)
        subjects = subjects.concat(data.subjects)
        if (data.total >= 50) {
          const data = await getSubjects(params, 50, 50)
          subjects = subjects.concat(data.subjects)
        }
        setSubjects(subjects)
      })()
    },
    [params]
  )

  return (
    <>
      <Wall subjects={subjects} params={params} />
      <div className="safe-zone-overlay">
        <div className="safe-zone-band top" />
        <div className="safe-zone-band right" />
        <div className="safe-zone-band bottom" />
        <div className="safe-zone-band left" />
      </div>
    </>
  )
}

export default App
