import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as React from 'react';
import { Platform } from 'react-native';

import DevLoadingView from '../environment/DevLoadingView';

/**
 * Append the Expo Fast Refresh view and optionally
 * keep the screen awake if a `expo-keep-awake` is installed.
 */
export function withDevTools<TComponent extends React.ComponentType<any>>(
  AppRootComponent: TComponent
): React.ComponentType<React.ComponentProps<TComponent>> {
  // This hook can be optionally imported because __DEV__ never changes during runtime.
  // Using __DEV__ like this enables tree shaking to remove the hook in production.
  const useOptionalKeepAwake: (tag?: string) => void = (() => {
    if (Platform.OS !== 'web') {
      try {
        // Optionally import expo-keep-awake
        const { useKeepAwake, ExpoKeepAwakeTag } = require('expo-keep-awake');
        return () => useKeepAwake(ExpoKeepAwakeTag, { suppressDeactivateWarnings: true });
      } catch {}
    }

    return () => {};
  })();

  const useExpoFastRefreshView = Platform.select({
    web: true,
    ios: Constants.executionEnvironment !== ExecutionEnvironment.Bare,
    default: false,
  });

  function WithDevTools(props: React.ComponentProps<TComponent>) {
    useOptionalKeepAwake();

    if (useExpoFastRefreshView) {
      return (
        <>
          <AppRootComponent {...props} />
          <DevLoadingView />
        </>
      );
    }

    return <AppRootComponent {...props} />;
  }

  const name = AppRootComponent.displayName || AppRootComponent.name || 'Anonymous';
  WithDevTools.displayName = `withDevTools(${name})`;

  return WithDevTools;
}
