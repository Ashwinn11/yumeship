import { Colors, FontFamily } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

type CalloutProps = {
  children: React.ReactNode;
  tone?: 'pink' | 'lavender' | 'butter' | 'paper';
  notch?: boolean;
  style?: ViewStyle;
};

const TONE_MAP = {
  pink: { bg: '#fadde5', border: '#e8a8b5', color: '#8b3a4a', quote: '#d77a8d' },
  lavender: { bg: '#ece4f7', border: '#c7b5e3', color: '#4d3982', quote: '#8b6fc4' },
  butter: { bg: '#fbecc4', border: '#e6c989', color: '#6b5114', quote: '#b8902a' },
  paper: { bg: Colors.vellum, border: Colors.lineStrong, color: Colors.ink, quote: Colors.sakuraDeep },
};

export function CalloutBubble({ children, tone = 'pink', notch = true, style }: CalloutProps) {
  const t = TONE_MAP[tone];

  return (
    <View style={[{ position: 'relative', alignSelf: 'flex-start' }, style]}>
      <View
        style={{
          backgroundColor: t.bg,
          borderWidth: 1.6,
          borderColor: t.border,
          borderRadius: 22,
          paddingHorizontal: 22,
          paddingTop: 14,
          paddingBottom: 18,
          minWidth: 180,
        }}
      >
        {/* opening quote */}
        <Text
          style={{
            position: 'absolute',
            top: 2,
            left: 8,
            fontFamily: 'Georgia',
            fontSize: 22,
            color: t.quote,
            fontStyle: 'italic',
            opacity: 0.85,
          }}
        >
          “
        </Text>

        <Text
          style={{
            fontFamily: FontFamily.script,
            fontSize: 16,
            lineHeight: 18,
            color: t.color,
            textAlign: 'center',
          }}
        >
          {children}
        </Text>

        {/* closing quote */}
        <Text
          style={{
            position: 'absolute',
            bottom: -2,
            right: 10,
            fontFamily: 'Georgia',
            fontSize: 26,
            color: t.quote,
            fontStyle: 'italic',
            opacity: 0.9,
          }}
        >
          ”
        </Text>
      </View>

      {notch && (
        <>
          <View
            style={{
              position: 'absolute',
              bottom: -6,
              right: 30,
              width: 18,
              height: 18,
              backgroundColor: t.bg,
              borderWidth: 1.6,
              borderColor: t.border,
              borderTopWidth: 0,
              borderLeftWidth: 0,
              borderBottomRightRadius: 6,
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 22,
              width: 24,
              height: 6,
              backgroundColor: t.bg,
            }}
          />
        </>
      )}
    </View>
  );
}

type ThoughtProps = {
  children: React.ReactNode;
  tone?: 'lavender' | 'pink';
  flower?: boolean;
  style?: ViewStyle;
};

const THOUGHT_TONE = {
  lavender: { bg: '#ece4f7', border: '#c7b5e3', color: '#4d3982' },
  pink: { bg: '#fadde5', border: '#e8a8b5', color: '#8b3a4a' },
};

export function ThoughtCloud({ children, tone = 'lavender', flower = true, style }: ThoughtProps) {
  const t = THOUGHT_TONE[tone];

  return (
    <View style={[{ position: 'relative', width: 220, height: 130 }, style]}>
      <Svg width="220" height="130" viewBox="0 0 220 130" style={StyleSheet.absoluteFill}>
        <Path
          d="M 30 60
             a 22 22 0 0 1 14 -28
             a 26 26 0 0 1 36 -14
             a 28 28 0 0 1 50 0
             a 26 26 0 0 1 38 12
             a 22 22 0 0 1 12 30
             a 22 22 0 0 1 -16 28
             a 26 26 0 0 1 -36 12
             a 28 28 0 0 1 -50 -2
             a 26 26 0 0 1 -38 -10
             a 22 22 0 0 1 -10 -28 Z"
          fill={t.bg}
          stroke={t.border}
          strokeWidth="1.8"
        />
      </Svg>

      <View
        style={{
          position: 'absolute',
          top: 22,
          bottom: 22,
          left: 36,
          right: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: FontFamily.script,
            fontSize: 16,
            lineHeight: 18,
            color: t.color,
            textAlign: 'center',
          }}
        >
          {children}
        </Text>
      </View>

      {flower && (
        <View style={{ position: 'absolute', bottom: 12, left: 22 }}>
          <Svg width="22" height="22" viewBox="0 0 22 22">
            {[0, 72, 144, 216, 288].map((r) => (
              <Ellipse
                key={r}
                cx="11"
                cy="6"
                rx="2.8"
                ry="4"
                fill="#f3b6c4"
                stroke="#d77a8d"
                strokeWidth="0.6"
                transform={`rotate(${r} 11 11)`}
              />
            ))}
            <Circle cx="11" cy="11" r="1.6" fill="#b8902a" />
          </Svg>
        </View>
      )}
    </View>
  );
}
