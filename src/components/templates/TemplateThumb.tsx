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
import { FlipPhoneContent } from '@/app/template/flip-phone';
import { TalkingAboutContent } from '@/app/template/talking-about';
import { BondBannerContent } from '@/app/template/bond-banner';
import { PolyChartContent } from '@/app/template/poly-chart';
import { ScenariosPreview } from '@/components/templates/ScenariosPreview';
import { TemplateDataCtx } from '@/store/templateData';

// Natural render width of templates (matches scroll padding on a ~390px screen)
const FULL_W = 360;

type ContentFC = React.FC<{ editing?: boolean }>;

const CONTENT_MAP: Record<string, ContentFC> = {
  'poly-chart': PolyChartContent,
  'scenarios': ScenariosPreview,
  'get-to-know': GetToKnowContent,
  'kawaii-ui': KawaiiUIContent,
  'heart-frame': HeartFrameContent,
  'aesthetic': AestheticContent,
  'this-or-that': ThisOrThatContent,
  'boundaries': BoundariesContent,
  'love-letter': LoveLetterContent,
  'storyline': StorylineContent,
  'headcanons': HeadcanonsContent,
  'flip-phone': FlipPhoneContent,
  'talking-about': TalkingAboutContent,
  'bond-banner': BondBannerContent,
};

type Props = {
  templateKey: string;
  width: number;
  height: number;
  /** sample values served to the template's data context, so the preview renders filled */
  data?: Record<string, string>;
};

export function TemplateThumb({ templateKey, width, height, data }: Props) {
  const Content = CONTENT_MAP[templateKey];
  if (!Content) return null;

  const scale = width / FULL_W;

  let content = <Content editing={false} />;
  if (data) {
    content = (
      <TemplateDataCtx.Provider value={{ get: (k, fb = '') => data[k] ?? fb, set: () => {}, bgColor: '', bgImage: '', textColor: '' }}>
        {content}
      </TemplateDataCtx.Provider>
    );
  }

  return (
    <View style={{ width, height, overflow: 'hidden' }} pointerEvents="none">
      <View style={{ width: FULL_W, transformOrigin: 'top left', transform: [{ scale }] }}>
        {content}
      </View>
    </View>
  );
}

// Pre-calculated card dimensions for the 2-col grid layout used in both
// Templates tab (padding 16, gap 10) and new-ship picker (padding 12, gap 10).
const { width: SCREEN_W } = Dimensions.get('window');
export const THUMB_CARD_W = Math.floor((SCREEN_W - 32 - 10) / 2);
export const THUMB_CARD_H = Math.floor(THUMB_CARD_W * 4 / 3);
