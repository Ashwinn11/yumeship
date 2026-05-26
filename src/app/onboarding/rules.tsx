import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { IconLock } from '@/components/ui/Icon';
import { PickerOption } from '@/components/ui/PickerOption';
import { StepDots } from '@/components/ui/StepDots';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { setOnbField } from '@/store/onboarding';

type RelType = 'romantic' | 'platonic' | 'familial';
type ShareType = 'ng' | 'welcome' | 'mirror';

export default function OnbRules() {
  const insets = useSafeAreaInsets();
  const [relType, setRelType] = useState<RelType>('romantic');
  const [shareType, setShareType] = useState<ShareType>('mirror');

  const handleRelType = (v: RelType) => { setRelType(v); setOnbField('relType', v); };
  const handleShareType = (v: ShareType) => { setShareType(v); setOnbField('shareType', v); };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + Spacing.s1, paddingBottom: insets.bottom + Spacing.s1 }]}>
      <View style={styles.dotsRow}>
        <StepDots step={3} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>step three · the rules</Text>
        <Text style={styles.heading}>What kind of love,{'\n'}and who's invited?</Text>

        {/* Relationship type */}
        <View style={styles.section}>
          <Field label="Relationship type">
            <View style={styles.pickerRow}>
              <PickerOption
                ja="恋"
                name="romantic"
                tint={Colors.sakuraDeep}
                tintBg={Colors.sakuraSoft}
                active={relType === 'romantic'}
                onPress={() => handleRelType('romantic')}
              />
              <PickerOption
                ja="友"
                name="platonic"
                tint={Colors.sageDeep}
                tintBg={Colors.sageSoft}
                active={relType === 'platonic'}
                onPress={() => handleRelType('platonic')}
              />
              <PickerOption
                ja="家"
                name="familial"
                tint={Colors.peachDeep}
                tintBg={Colors.peachSoft}
                active={relType === 'familial'}
                onPress={() => handleRelType('familial')}
              />
            </View>
          </Field>
        </View>

        {/* Sharing */}
        <View style={styles.section}>
          <Field label="Sharing — about doubles">
            <View style={styles.pickerRow}>
              <PickerOption
                ja="禁"
                name="sharing NG"
                tint={Colors.ember}
                tintBg="#fde0d4"
                active={shareType === 'ng'}
                onPress={() => handleShareType('ng')}
              />
              <PickerOption
                ja="可"
                name="welcome"
                tint={Colors.sageDeep}
                tintBg={Colors.sageSoft}
                active={shareType === 'welcome'}
                onPress={() => handleShareType('welcome')}
              />
              <PickerOption
                ja="鏡"
                name="mirror"
                tint={Colors.lavenderDeep}
                tintBg={Colors.lavenderSoft}
                active={shareType === 'mirror'}
                onPress={() => handleShareType('mirror')}
              />
            </View>
          </Field>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <View style={styles.privacyIcon}>
            <IconLock size={14} color={Colors.lavenderDeep} />
          </View>
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Private by default</Text>
            <Text style={styles.privacyBody}>
              Nothing leaves your phone. Notifications never reveal the app on your lock screen.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          full
          onPress={() => router.push('/onboarding/template' as any)}
        >
          continue · pick a template
        </Button>
        <Pressable onPress={() => router.push('/onboarding/template' as any)} style={styles.skipPressable}>
          <Text style={styles.skip}>skip for now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  dotsRow: {
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s4,
    paddingBottom: Spacing.s1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.s6,
    paddingTop: Spacing.s5,
    paddingBottom: Spacing.s4,
  },
  eyebrow: {
    fontFamily: FontFamily.marker,
    fontSize: 10,
    color: Colors.sageDeep,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heading: {
    fontFamily: FontFamily.displayItalic,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.3,
    color: Colors.ink,
    marginTop: Spacing.s2,
  },
  section: {
    marginTop: Spacing.s4,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  privacyNote: {
    marginTop: Spacing.s5,
    padding: Spacing.s3,
    paddingHorizontal: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.r3,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  privacyIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.r2,
    backgroundColor: Colors.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: FontSize.caption,
    color: Colors.ink,
    marginBottom: 2,
  },
  privacyBody: {
    fontSize: 11,
    fontFamily: FontFamily.ui,
    color: Colors.ink2,
    lineHeight: 16,
  },
  actions: {
    paddingHorizontal: Spacing.s6,
    paddingBottom: Spacing.s3,
    gap: Spacing.s2,
  },
  skipPressable: {
    alignItems: 'center',
  },
  skip: {
    fontFamily: FontFamily.ui,
    fontSize: FontSize.meta,
    color: Colors.ink3,
    textDecorationLine: 'underline',
  },
});
