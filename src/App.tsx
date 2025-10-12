import { useEffect, useState } from 'react';
import './App.css'
import type { Params, Subject } from './types';
import { getSubjects } from './api';
import Wall from './Wall';
import { useHash } from './hooks/useHash';

const defaultParams: Params = {
  username: 'sai',
  subjectType: 'anime',
  collectionType: 'all',
};

function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const params = useHash(defaultParams);

  useEffect(
    () => {
      getSubjects(params).then(items => {
        setSubjects(items.subjects);
      });
    },
    [params]
  )

  return (
    <Wall subjects={subjects} />
  )
}

export default App
