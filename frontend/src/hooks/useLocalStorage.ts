import { useEffect, useState } from "react";

const parseJSON = (data: string | null) => {
  if (!data) {
    return null;
  } else {
    return JSON.parse(data);
  }
};

export const useLocalStorage = <T>(storageKey: string, fallbackState: T) => {
  const [value, setValue] = useState(
    parseJSON(localStorage.getItem(storageKey)) ?? fallbackState,
  );

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }, [value, storageKey]);

  return [value, setValue];
};
