import React, { useState, useRef, useEffect } from 'react';

const QuickLRU = ({ maxSize = 1000, maxAge = Infinity, onEviction, children }) => {
  const [cache, setCache] = useState(new Map());
  const [size, setSize] = useState(0);
  const timestampsRef = useRef(new Map());
  const accessOrderRef = useRef([]);

  const cleanup = () => {
    const now = Date.now();
    const newCache = new Map();
    const newTimestamps = new Map();
    const newAccessOrder = [];

    for (const [key, value] of cache.entries()) {
      const timestamp = timestampsRef.current.get(key);
      if (timestamp && now - timestamp < maxAge) {
        newCache.set(key, value);
        newTimestamps.set(key, timestamp);
        newAccessOrder.push(key);
      } else if (onEviction) {
        onEviction(key, value);
      }
    }

    setCache(newCache);
    timestampsRef.current = newTimestamps;
    accessOrderRef.current = newAccessOrder;
    setSize(newCache.size);
  };

  useEffect(() => {
    const interval = setInterval(cleanup, 1000);
    return () => clearInterval(interval);
  }, [maxAge]);

  const set = (key, value, options = {}) => {
    const itemMaxAge = options.maxAge || maxAge;
    const now = Date.now();

    if (cache.has(key)) {
      cache.set(key, value);
      timestampsRef.current.set(key, now);
      const index = accessOrderRef.current.indexOf(key);
      if (index > -1) {
        accessOrderRef.current.splice(index, 1);
      }
      accessOrderRef.current.push(key);
    } else {
      if (cache.size >= maxSize) {
        const oldestKey = accessOrderRef.current.shift();
        if (oldestKey) {
          const oldValue = cache.get(oldestKey);
          cache.delete(oldestKey);
          timestampsRef.current.delete(oldestKey);
          if (onEviction) {
            onEviction(oldestKey, oldValue);
          }
        }
      }
      cache.set(key, value);
      timestampsRef.current.set(key, now);
      accessOrderRef.current.push(key);
      setSize(cache.size);
    }

    setCache(new Map(cache));
    return this;
  };

  const get = (key) => {
    if (!cache.has(key)) return undefined;

    const value = cache.get(key);
    const timestamp = timestampsRef.current.get(key);
    const now = Date.now();

    if (timestamp && now - timestamp >= maxAge) {
      cache.delete(key);
      timestampsRef.current.delete(key);
      const index = accessOrderRef.current.indexOf(key);
      if (index > -1) {
        accessOrderRef.current.splice(index, 1);
      }
      setSize(cache.size);
      setCache(new Map(cache));
      if (onEviction) {
        onEviction(key, value);
      }
      return undefined;
    }

    const index = accessOrderRef.current.indexOf(key);
    if (index > -1) {
      accessOrderRef.current.splice(index, 1);
    }
    accessOrderRef.current.push(key);
    setCache(new Map(cache));

    return value;
  };

  const has = (key) => {
    if (!cache.has(key)) return false;

    const timestamp = timestampsRef.current.get(key);
    const now = Date.now();

    if (timestamp && now - timestamp >= maxAge) {
      const value = cache.get(key);
      cache.delete(key);
      timestampsRef.current.delete(key);
      const index = accessOrderRef.current.indexOf(key);
      if (index > -1) {
        accessOrderRef.current.splice(index, 1);
      }
      setSize(cache.size);
      setCache(new Map(cache));
      if (onEviction) {
        onEviction(key, value);
      }
      return false;
    }

    return true;
  };

  const peek = (key) => {
    if (!cache.has(key)) return undefined;

    const timestamp = timestampsRef.current.get(key);
    const now = Date.now();

    if (timestamp && now - timestamp >= maxAge) {
      const value = cache.get(key);
      cache.delete(key);
      timestampsRef.current.delete(key);
      const index = accessOrderRef.current.indexOf(key);
      if (index > -1) {
        accessOrderRef.current.splice(index, 1);
      }
      setSize(cache.size);
      setCache(new Map(cache));
      if (onEviction) {
        onEviction(key, value);
      }
      return undefined;
    }

    return cache.get(key);
  };

  const deleteItem = (key) => {
    if (!cache.has(key)) return false;

    const value = cache.get(key);
    cache.delete(key);
    timestampsRef.current.delete(key);
    const index = accessOrderRef.current.indexOf(key);
    if (index > -1) {
      accessOrderRef.current.splice(index, 1);
    }
    setSize(cache.size);
    setCache(new Map(cache));
    if (onEviction) {
      onEviction(key, value);
    }
    return true;
  };

  const clear = () => {
    if (onEviction) {
      for (const [key, value] of cache.entries()) {
        onEviction(key, value);
      }
    }
    cache.clear();
    timestampsRef.current.clear();
    accessOrderRef.current = [];
    setSize(0);
    setCache(new Map());
  };

  const resize = (newMaxSize) => {
    while (cache.size > newMaxSize) {
      const oldestKey = accessOrderRef.current.shift();
      if (oldestKey) {
        const value = cache.get(oldestKey);
        cache.delete(oldestKey);
        timestampsRef.current.delete(oldestKey);
        if (onEviction) {
          onEviction(oldestKey, value);
        }
      }
    }
    setSize(cache.size);
    setCache(new Map(cache));
  };

  const keys = () => {
    return Array.from(cache.keys());
  };

  const values = () => {
    return Array.from(cache.values());
  };

  const entries = () => {
    return Array.from(cache.entries());
  };

  const entriesAscending = () => {
    return accessOrderRef.current.map(key => [key, cache.get(key)]);
  };

  const entriesDescending = () => {
    return accessOrderRef.current.slice().reverse().map(key => [key, cache.get(key)]);
  };

  const contextValue = {
    size,
    set,
    get,
    has,
    peek,
    delete: deleteItem,
    clear,
    resize,
    keys,
    values,
    entries,
    entriesAscending,
    entriesDescending
  };

  return children ? children(contextValue) : null;
};

export default QuickLRU; 