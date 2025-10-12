import { useState, useEffect, useCallback } from 'react';
import type { Params } from '../types';

export function useHash(defaultParams: Params): Params {

  const getParamsFromHash = useCallback((): Params => {
    const hash = window.location.hash.slice(1);
    const hashParams = new URLSearchParams(hash);

    const username = hashParams.get('username') || defaultParams.username;
    const subjectType = (hashParams.get('subject') as Params['subjectType']) || defaultParams.subjectType;
    const collectionType = (hashParams.get('collection') as Params['collectionType']) || defaultParams.collectionType;

    return {
      username,
      subjectType,
      collectionType,
    };
  }, [defaultParams]);

  const [params, setParams] = useState<Params>(getParamsFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      const newParams = getParamsFromHash();
      setParams(prevParams =>
        JSON.stringify(prevParams) !== JSON.stringify(newParams) ? newParams : prevParams
      );
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [getParamsFromHash]);

  return params;
}