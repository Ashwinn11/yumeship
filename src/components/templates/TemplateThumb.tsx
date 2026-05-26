import React from 'react';
import { View, Dimensions } from 'react-native';

import { GetToKnowContent } from '@/app/template/get-to-know';
import { KawaiiUIContent } from '@/app/template/kawaii-ui';
import { HeartFrameContent } from '@/app/template/heart-frame';
import { AestheticContent } from '@/app/template/aesthetic';
import { ThisOrThatContent } from '@/app/template/this-or-that';
import { BoundariesContent } from '@/app/template/boundaries';
import { LoveLetterContent } from '@/app/template/love-letter';
import { StorylineContent } from '@/app/template/storyline';
import { HeadcanonsContent } from '@/app/template/headcanons';

// Natural render width of templates (matches scroll padding on a ~390px screen)
const FULL_W = 360;
// Approximate natural height — used to compute the Y translate so the top of the
// content aligns with the top of the thumbnail. 680 works for all 9 templates.
const APPROX_H = 680;

type ContentFC = React.FC<{ editing?: boolean }>;

const CONTENT_MAP: Record<string, ContentFC> = {
  'get-to-know': GetToKnowContent,
  'kawaii-ui': KawaiiUIContent,
  'heart-frame': HeartFrameContent,
  'aesthetic': AestheticContent,
  'this-or-that': ThisOrThatContent,
  'boundaries': BoundariesContent,
  'love-letter': LoveLetterContent,
  'storyline': StorylineContent,
  'headcanons': HeadcanonsContent,
};

type Props = { templateKey: string; width: number; height: number };

export function TemplateThumb({ templateKey, width, height }: Props) {
  const Content = CONTENT_MAP[templateKey];
  if (!Content) return null;

  const scale = width / FULL_W;
  // Translate before scale so the top-left of the content aligns with (0,0) of the clip view.
  const tx = -(FULL_W * (1 - scale)) / 2;
  const ty = -(APPROX_H * (1 - scale)) / 2;

  return (
    <View style={{ width, height, overflow: 'hidden' }} pointerEvents="none">
      <View style={{ width: FULL_W, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }}>
        <Content editing={false} />
      </View>
    </View>
  );
}

// Pre-calculated card dimensions for the 2-col grid layout used in both
// Templates tab (padding 16, gap 10) and new-ship picker (padding 12, gap 10).
const { width: SCREEN_W } = Dimensions.get('window');
export const THUMB_CARD_W = Math.floor((SCREEN_W - 32 - 10) / 2);
export const THUMB_CARD_H = Math.floor(THUMB_CARD_W * 4 / 3);
