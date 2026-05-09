import { useEffect, useState, useCallback } from "react";

const KEY = "notifications:read-ids";
const DEFAULT_UNREAD_IDS = [1, 2]; // mock notifications id 1 & 2 are unread by default

const readSet = (): Set<number> => {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
};

const writeSet = (s: Set<number>) => {
  localStorage.setItem(KEY, JSON.stringify(Array.from(s)));
  window.dispatchEvent(new Event("notifications:updated"));
};

export const useUnreadNotifications = () => {
  const compute = useCallback(() => {
    const read = readSet();
    return DEFAULT_UNREAD_IDS.filter((id) => !read.has(id)).length;
  }, []);

  const [count, setCount] = useState<number>(compute);

  useEffect(() => {
    const update = () => setCount(compute());
    window.addEventListener("storage", update);
    window.addEventListener("notifications:updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("notifications:updated", update);
    };
  }, [compute]);

  const markAllRead = () => {
    const s = readSet();
    DEFAULT_UNREAD_IDS.forEach((id) => s.add(id));
    writeSet(s);
  };

  const markRead = (id: number) => {
    const s = readSet();
    s.add(id);
    writeSet(s);
  };

  return { count, markAllRead, markRead };
};
