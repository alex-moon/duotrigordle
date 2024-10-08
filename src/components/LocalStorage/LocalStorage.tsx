import { Fragment, useEffect, useLayoutEffect, useState } from "react";
import {
  storageAction,
  settingsAction,
  statsAction,
  useAppDispatch,
  useAppSelector,
  uiAction,
} from "../../store";
import {
  loadFromLocalStorage,
  STORAGE_KEY_STORAGE,
  parseStorage,
  STORAGE_KEY_SETTINGS,
  parseSettings,
  STORAGE_KEY_STATS,
  parseStats,
  saveToLocalStorage,
} from "./storage";

export function LocalStorage() {
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    if (!loaded) {
      const storage = loadFromLocalStorage(STORAGE_KEY_STORAGE, parseStorage);
      if (storage) {
        dispatch(storageAction.load(storage));
      }
      const settings = loadFromLocalStorage(
        STORAGE_KEY_SETTINGS,
        parseSettings
      );
      if (settings) {
        dispatch(settingsAction.update(settings));
      }
      const stats = loadFromLocalStorage(STORAGE_KEY_STATS, parseStats);
      if (stats) {
        dispatch(statsAction.load(stats));
      }

      // @todo check if about seen first
      dispatch(uiAction.showModal("about"));

      setLoaded(true);
    }
  }, [dispatch, loaded]);

  const storage = useAppSelector((s) => s.storage);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(STORAGE_KEY_STORAGE, storage);
    }
  }, [storage, loaded]);
  const settings = useAppSelector((s) => s.settings);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(STORAGE_KEY_SETTINGS, settings);
    }
  }, [settings, loaded]);
  const stats = useAppSelector((s) => s.stats);
  useEffect(() => {
    if (loaded) {
      saveToLocalStorage(STORAGE_KEY_STATS, stats);
    }
  }, [stats, loaded]);

  return <Fragment />;
}
