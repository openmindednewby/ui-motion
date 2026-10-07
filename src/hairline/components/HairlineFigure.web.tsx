import React, { useEffect, useRef } from 'react';

import { StyleSheet, View } from 'react-native';

import type { Figure } from '@lucasmarkes/hairline';

import { DEFAULT_HAIRLINE_INTENSITY, HAIRLINE_ASPECT_RATIO, HAIRLINE_TEST_ID } from '../constants';
import { FIGURE_REGISTRY } from '../data/figureRegistry';
import type { HairlineFigureProps } from '../types';
import { hairlineVars } from '../utils/hairlineVars';

const styles = StyleSheet.create({
  host: { width: '100%', aspectRatio: HAIRLINE_ASPECT_RATIO },
});

const toElement = (view: View | null): HTMLElement | null => view as unknown as HTMLElement | null;

/** Mounts a hairline figure on the host View's DOM node (RN-web); destroyed on unmount. */
export const HairlineFigure = ({
  figure,
  colors,
  intensity = DEFAULT_HAIRLINE_INTENSITY,
  label,
  testID = HAIRLINE_TEST_ID,
}: HairlineFigureProps): React.ReactElement => {
  const hostRef = useRef<View>(null);
  const figureRef = useRef<Figure | null>(null);
  const optionsRef = useRef({ intensity, label });
  optionsRef.current = { intensity, label };

  useEffect(() => {
    const el = toElement(hostRef.current);
    if (el === null) return undefined;
    const vars = Object.entries(hairlineVars(colors));
    vars.forEach(([name, value]) => el.style.setProperty(name, value));
    return () => vars.forEach(([name]) => el.style.removeProperty(name));
  }, [colors]);

  useEffect(() => {
    const el = toElement(hostRef.current);
    if (el === null) return undefined;
    const mounted = FIGURE_REGISTRY[figure](el, optionsRef.current);
    figureRef.current = mounted;
    return () => {
      mounted.destroy();
      figureRef.current = null;
    };
  }, [figure]);

  useEffect(() => {
    figureRef.current?.update({ intensity, label });
  }, [intensity, label]);

  return <View ref={hostRef} style={styles.host} testID={testID} />;
};
