import { Colors, FontFamily } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

type PaperProps = {
  width?: number;
  height?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
  color?: string;
  rotate?: number;
};

export function PaperLined({ width = 110, height = 130, children, style }: PaperProps) {
  const lineCount = 5;

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: Colors.vellum,
          borderRadius: 4,
          shadowColor: 'rgba(110, 58, 90, 0.08)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 2,
          position: 'relative',
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {Array.from({ length: lineCount }).map((_, i) => (
          <Line
            key={i}
            x1="10"
            x2={width - 10}
            y1={26 + i * 16}
            y2={26 + i * 16}
            stroke={Colors.line}
            strokeWidth="1"
          />
        ))}
        <Line
          x1="22"
          x2="22"
          y1="6"
          y2={height - 6}
          stroke={Colors.sakura}
          strokeWidth="1"
          opacity={0.6}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          inset: 0,
          paddingLeft: 28,
          paddingRight: 12,
          paddingTop: 14,
          paddingBottom: 12,
        }}
      >
        {children}
      </View>
    </View>
  );
}

export function PaperScalloped({ width = 100, height = 130, children, color = '#fadde5', style }: PaperProps) {
  const scallop = 5;
  const r = width / (scallop * 2);

  const pathD = `
    M 0 ${r}
    ${Array.from({ length: scallop })
      .map((_, i) => `A ${r} ${r} 0 0 1 ${(i * 2 + 2) * r} ${r}`)
      .join(' ')}
    L ${width} ${height - r}
    ${Array.from({ length: scallop })
      .map((_, i) => `A ${r} ${r} 0 0 1 ${width - (i * 2 + 2) * r} ${height - r}`)
      .join(' ')}
    Z
  `;

  return (
    <View
      style={[
        {
          width,
          height,
          shadowColor: 'rgba(110, 58, 90, 0.10)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 6,
          elevation: 2,
          position: 'relative',
        },
        style,
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={pathD} fill={color} />
      </Svg>
      <View style={{ position: 'absolute', inset: 12, top: 14 }}>{children}</View>
      <Text
        style={{
          position: 'absolute',
          bottom: 8,
          right: 12,
          color: Colors.sakuraInk,
          opacity: 0.6,
          fontSize: 12,
        }}
      >
        ♡
      </Text>
    </View>
  );
}

export function PaperPolaroid({ width = 92, height = 120, rotate = 4, children, style }: PaperProps) {
  return (
    <View
      style={[
        {
          width,
          height,
          padding: 8,
          paddingBottom: 24,
          backgroundColor: '#ffffff',
          shadowColor: 'rgba(110, 58, 90, 0.12)',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: 4,
          transform: [{ rotate: `${rotate}deg` }],
          position: 'relative',
        },
        style,
      ]}
    >
      <View
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: Colors.sakuraSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
      <Text
        style={{
          position: 'absolute',
          bottom: 4,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FontFamily.script,
          fontSize: 12,
          color: Colors.ink2,
        }}
      >
        ♡
      </Text>
    </View>
  );
}

export function PaperGrid({ width = 100, height = 130, children, style }: PaperProps) {
  const gridSpacing = 10;
  const cols = Math.floor(width / gridSpacing);
  const rows = Math.floor(height / gridSpacing);

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: '#fbecc4',
          borderRadius: 4,
          shadowColor: 'rgba(110, 58, 90, 0.08)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 2,
          position: 'relative',
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {Array.from({ length: cols + 1 }).map((_, i) => (
          <Line
            key={`c-${i}`}
            x1={i * gridSpacing}
            y1="0"
            x2={i * gridSpacing}
            y2={height}
            stroke="#f0d189"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: rows + 1 }).map((_, i) => (
          <Line
            key={`r-${i}`}
            x1="0"
            y1={i * gridSpacing}
            x2={width}
            y2={i * gridSpacing}
            stroke="#f0d189"
            strokeWidth="0.5"
          />
        ))}
      </Svg>
      <View style={{ position: 'absolute', inset: 14 }}>{children}</View>
    </View>
  );
}

export function ClipBinder({ size = 30, color = Colors.butter, rotate = 0, style }: { size?: number; color?: string; rotate?: number; style?: ViewStyle }) {
  return (
    <View style={[{ transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <Svg width={size} height={size * 1.6} viewBox="0 0 20 32">
        <Path
          d="M10 2C6 2 3 5 3 9v17a4 4 0 0 0 8 0V9a3 3 0 1 1 6 0v17"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}
