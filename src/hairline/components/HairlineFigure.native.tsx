import React, { useMemo } from 'react';

import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { DEFAULT_HAIRLINE_INTENSITY, HAIRLINE_ASPECT_RATIO, HAIRLINE_TEST_ID } from '../constants';
import { HAIRLINE_BUNDLE } from '../data/hairlineBundle';
import type { HairlineFigureProps } from '../types';
import { buildHairlineHtml } from '../utils/buildHairlineHtml';
import { hairlineVars } from '../utils/hairlineVars';

const ORIGIN_WHITELIST = ['about:blank'];

const styles = StyleSheet.create({
  host: { width: '100%', aspectRatio: HAIRLINE_ASPECT_RATIO, overflow: 'hidden' },
  web: { flex: 1 },
});

/** Renders a hairline figure in a WebView with the upstream bundle inlined (iOS/Android). */
export const HairlineFigure = ({
  figure,
  colors,
  intensity = DEFAULT_HAIRLINE_INTENSITY,
  label,
  testID = HAIRLINE_TEST_ID,
}: HairlineFigureProps): React.ReactElement => {
  const html = useMemo(
    () => buildHairlineHtml({ bundle: HAIRLINE_BUNDLE, figure, vars: hairlineVars(colors), intensity, label }),
    [figure, colors, intensity, label],
  );
  const plate = useMemo(() => ({ backgroundColor: colors.background }), [colors.background]);

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={[styles.host, plate]} testID={testID}>
      <WebView
        source={{ html }}
        originWhitelist={ORIGIN_WHITELIST}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        style={[styles.web, plate]}
        importantForAccessibility="no-hide-descendants"
      />
    </View>
  );
};
