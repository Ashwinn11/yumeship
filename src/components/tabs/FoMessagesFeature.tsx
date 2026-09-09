import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { MockPhoneTop } from '@/components/ui/MockPhone';
import { StickerEnvelope } from '@/components/deco/Stickers';
import { WashiTape } from '@/components/deco/WashiTape';
import { CozyModal } from '@/components/ui/CozyModal';
import { IconPlus } from '@/components/ui/Icon';
import { Colors, FontFamily, Radius, Shadow, Spacing, sf } from '@/constants/theme';
import { newId } from '@/db/client';
import { AVATAR_IMAGE } from '@/lib/imageProps';
import { persistImage } from '@/lib/localMedia';
import { updateFo, useFos } from '@/store/fo';
import {
  addFoMessage, deleteFoMessage, FoMessage, senderFace, senderOptions,
  syncFoMessagesDb, toggleFoMessage, updateFoMessage, useFoMessages,
} from '@/store/foNotifications';
import { requestPermission } from '@/store/notifications';
import { usePremium } from '@/store/premium';
import { Ship, useShip } from '@/store/ships';

// ─── F/O Notifications feature ───────────────────────────────────────────────

const STARTER_PRESETS: Record<string, string[]> = {
  'Good morning': [
    'good morning! did you sleep well?~',
    'morning ♡ hope you have a wonderful day today!',
    'good morning, sunshine! time to wake up~',
    "wakey wakey! i'm already thinking of you~"
  ],
  'Goodnight': [
    'goodnight! sweet dreams~',
    "sleep well, i'll be dreaming of you ♡",
    'goodnight, close your eyes and rest well~',
    "heading to bed! can't wait to talk to you tomorrow ♡"
  ],
  'F/O loves you': [
    'i love you so much, never forget that! ♡',
    'just a reminder that you mean the world to me~',
    'sending you a big warm hug right now!',
    "i'm so lucky to have you in my life~"
  ],
  'Take care': [
    'drink some water for me. okay?',
    "don't forget to take a break and breathe~",
    'make sure you eat something yummy today! ♡',
    "please take care of yourself, you're precious to me"
  ]
};

const STARTERS = [
  { emoji: '☀️', text: 'Good morning' },
  { emoji: '🌙', text: 'Goodnight' },
  { emoji: '✨', text: 'F/O loves you' },
  { emoji: '💾', text: 'Take care' },
];



export function FoMessagesFeature({ shipId, shipName, setCustomBack }: { shipId: string; shipName: string; setCustomBack: (fn: (() => void) | null) => void }) {
  const messages = useFoMessages(shipId);
  const composeShip = useShip(shipId);
  const isPremium = usePremium();
  const [composingMsg, setComposingMsg] = useState<FoMessage | 'new' | null>(null);
  const [msgDeleteTarget, setMsgDeleteTarget] = useState<string | null>(null);
  const activeCount = messages.filter((m) => m.active).length;

  useEffect(() => {
    syncFoMessagesDb();
  }, []);

  if (composingMsg !== null) {
    return (
      <FoCompose
        shipName={shipName}
        ship={composeShip}
        initialMessage={composingMsg === 'new' ? undefined : composingMsg}
        onQueue={async (queueData, sender, senderId) => {
          if (composingMsg === 'new') {
            for (const item of queueData) {
              await addFoMessage(shipId, item.body, item.hour, sender, item.minute, item.arrivalDay, 1, senderId);
            }
          } else {
            const first = queueData[0];
            if (first) {
              await updateFoMessage(composingMsg.id, first.body, first.hour, sender, shipName, first.minute, first.arrivalDay, senderId);
            }
            if (queueData.length > 1) {
              for (let i = 1; i < queueData.length; i++) {
                const item = queueData[i];
                await addFoMessage(shipId, item.body, item.hour, sender, item.minute, item.arrivalDay, 1, senderId);
              }
            }
          }
          setComposingMsg(null);
          setCustomBack(null);
        }}
      />
    );
  }

  return (
    <View style={fo.wrap}>
      <CozyModal
        visible={!!msgDeleteTarget}
        title="delete this message?"
        message="They won't send this anymore."
        confirmText="Delete"
        cancelText="keep it"
        isDestructive
        onConfirm={() => { if (msgDeleteTarget) deleteFoMessage(msgDeleteTarget); setMsgDeleteTarget(null); }}
        onClose={() => setMsgDeleteTarget(null)}
      />
      <View style={fo.hubHeader}>
        <View style={fo.hubLeft}>
          <Text style={fo.eyebrow}>TRACKING</Text>
          <Text style={fo.activeCount}>{activeCount} active</Text>
          {messages.length === 0 && <Text style={fo.noSaved}>nothing from them yet.</Text>}
        </View>
        <Pressable style={fo.newBtn} onPress={() => {
          if (!isPremium && messages.length >= 1) {
            router.push({ pathname: '/paywall', params: { reason: 'fo-messages' } });
          } else {
            setComposingMsg('new');
            setCustomBack(() => () => { setComposingMsg(null); setCustomBack(null); });
          }
        }}>
          <IconPlus size={12} color={Colors.sakuraDeep} />
          <Text style={fo.newBtnText}>new</Text>
        </Pressable>
      </View>

      {messages.length === 0 ? (
        <View style={[fo.emptyCard, { flex: 1, justifyContent: 'center', paddingTop: 40, paddingHorizontal: 20, gap: 12, alignItems: 'center', backgroundColor: 'transparent', borderWidth: 0 }]}>
          <StickerEnvelope size={88} />
          <Text style={{ fontFamily: FontFamily.script, fontSize: sf(26), color: Colors.ink, textAlign: 'center', marginTop: 10 }}>
            no notifications yet
          </Text>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: Colors.sakuraDeep,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 99,
              shadowColor: 'rgba(110, 58, 90, 0.12)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 3,
              elevation: 1,
              marginTop: 10,
            }}
            onPress={() => {
              setComposingMsg('new');
              setCustomBack(() => () => { setComposingMsg(null); setCustomBack(null); });
            }}
          >
            <IconPlus size={12} color={Colors.vellum} />
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(14), color: Colors.vellum }}>add a notification</Text>
          </Pressable>
        </View>
      ) : (
        <View style={fo.list}>
          {messages.map((m) => {
            const hour = m.scheduledHour;
            const minute = m.scheduledMinute;
            const arrivalDay = m.arrivalDay;
            let bigTimeStr = '';
            let ampmStr = '';
            let subtextStr = '';

            if (arrivalDay === 'now' || hour === -2) {
              bigTimeStr = 'NOW';
              subtextStr = 'triggers immediately';
            } else if (arrivalDay === 'random') {
              bigTimeStr = '❖';
              ampmStr = '';
              subtextStr = 'random daily';
            } else {
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              const displayMin = String(minute).padStart(2, '0');
              bigTimeStr = `${displayHour}:${displayMin}`;
              ampmStr = ampm;

              if (arrivalDay === 'today') {
                subtextStr = 'today only';
              } else if (arrivalDay === 'tomorrow') {
                subtextStr = 'tomorrow only';
              } else {
                subtextStr = 'every day';
              }
            }
            const displaySender = m.senderName || shipName;

            let displayBody = m.body;
            let variationCount = 0;
            try {
              if (m.body.startsWith('[')) {
                const arr = JSON.parse(m.body);
                if (Array.isArray(arr) && arr.length > 0) {
                  displayBody = arr[0];
                  variationCount = arr.length;
                }
              }
            } catch (_) { }

            const isOneShot = arrivalDay === 'now' || arrivalDay === 'today' || arrivalDay === 'tomorrow';
            let nextScheduledStr = '';
            if (arrivalDay === 'now') {
              nextScheduledStr = 'now';
            } else if (arrivalDay === 'random') {
              nextScheduledStr = 'random time daily';
            } else {
              const displayMin = String(minute).padStart(2, '0');
              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
              const ampm = hour >= 12 ? 'pm' : 'am';
              const timeStr = `${displayHour}:${displayMin} ${ampm}`;

              if (arrivalDay === 'today') {
                nextScheduledStr = `today at ${timeStr}`;
              } else if (arrivalDay === 'tomorrow') {
                nextScheduledStr = `tomorrow at ${timeStr}`;
              } else {
                nextScheduledStr = `every day at ${timeStr}`;
              }
            }

            return (
              <View
                key={m.id}
                style={[fo.msgCard, !m.active && fo.msgCardOff]}
              >
                {/* Washi tape corner accent */}
                <View style={{ position: 'absolute', top: -3, left: 12, zIndex: 10 }} pointerEvents="none">
                  <WashiTape pattern="floral" width={52} height={10} rotate={-4} color={Colors.sakura} />
                </View>

                {/* Top row: sender name (left) + Switch (right) */}
                <View style={fo.msgCardTop}>
                  <Text style={fo.msgSender}>{displaySender}</Text>
                  <Switch
                    value={m.active}
                    onValueChange={(val) => toggleFoMessage(m.id, val, m.senderName || shipName)}
                    trackColor={{ false: Colors.line, true: Colors.sage }}
                    thumbColor="#ffffff"
                    ios_backgroundColor={Colors.line}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginTop: -4, marginRight: -4 }}
                  />
                </View>

                {/* Message body in Caveat script */}
                <Text style={[fo.msgBody, !m.active && fo.msgBodyOff]}>"{displayBody}"</Text>

                {/* Bottom row: Timing Label (left) + Edit/Delete Links (right) */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, borderTopWidth: 0.5, borderTopColor: Colors.line + '55', paddingTop: 6 }}>
                  <Text style={fo.msgTime}>{nextScheduledStr}</Text>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Pressable
                      onPress={() => {
                        setComposingMsg(m);
                        setCustomBack(() => () => { setComposingMsg(null); setCustomBack(null); });
                      }}
                      style={{ paddingVertical: 4, paddingHorizontal: 6 }}
                    >
                      <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink3 }}>edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setMsgDeleteTarget(m.id)}
                      style={{ paddingVertical: 4, paddingHorizontal: 6 }}
                    >
                      <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ember, opacity: 0.8 }}>delete</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ height: Spacing.s9 }} />
        </View>
      )}
    </View>
  );
}

const ARRIVAL_DAYS = [
  { id: 'now', label: 'Now' },
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'everyday', label: 'Every day' },
  { id: 'random', label: 'Random daily' },
] as const;

const OpenLockIcon = ({ size = 13, color = '#ffffff' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    {/* Closed shackle */}
    <Path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    {/* Filled body */}
    <Rect x="2" y="6" width="10" height="7" rx="1.5" fill={color} />
  </Svg>
);

type ComposeOption = {
  id: string;
  body: string;
  arrivalDay: 'now' | 'today' | 'tomorrow' | 'everyday' | 'random';
  customHour: number;
  customMinute: number;
  customAmPm: 'AM' | 'PM';
  customHourText: string;
  customMinuteText: string;
};

function FoCompose({ shipName, ship, initialMessage, onQueue }: {
  shipName: string;
  ship?: Ship;
  initialMessage?: FoMessage;
  onQueue: (options: { body: string; hour: number; minute: number; arrivalDay: 'now' | 'today' | 'tomorrow' | 'everyday' | 'random' }[], senderName: string, senderId: string) => void;
}) {
  const isPremium = usePremium();
  const [notifDenied, setNotifDenied] = useState(false);
  const [pendingQueue, setPendingQueue] = useState<ComposeOption[] | null>(null);
  
  const [options, setOptions] = useState<ComposeOption[]>(() => {
    if (initialMessage) {
      const hr = initialMessage.scheduledHour;
      const min = initialMessage.scheduledMinute;
      return [{
        id: initialMessage.id,
        body: initialMessage.body,
        arrivalDay: initialMessage.arrivalDay ?? 'everyday',
        customHour: hr >= 0 ? (hr % 12 || 12) : 9,
        customMinute: min,
        customAmPm: hr >= 12 ? 'PM' : 'AM',
        customHourText: String(hr >= 0 ? (hr % 12 || 12) : 9),
        customMinuteText: String(min).padStart(2, '0'),
      }];
    }
    return [{
      id: newId(),
      body: '',
      arrivalDay: 'everyday',
      customHour: 9,
      customMinute: 0,
      customAmPm: 'AM',
      customHourText: '9',
      customMinuteText: '00',
    }];
  });

  // subscribed so a newly added F/O (or a new photo on one) shows up here
  // without leaving the composer
  const allFos = useFos();
  const fromOptions = useMemo(
    () => senderOptions(ship?.id ?? '', shipName),
    [ship?.id, ship?.members, shipName, allFos],
  );
  const initialSender = fromOptions.find((o) => o.id === initialMessage?.senderId && o.isFo)
    ?? fromOptions.find((o) => o.isFo)
    ?? fromOptions[0];
  const [senderId, setSenderId] = useState(initialMessage?.senderId || initialSender?.id || '');
  const [senderName, setSenderName] = useState(
    // an edited message keeps its sender even if that member was since renamed
    initialMessage?.senderName || initialSender?.name || shipName,
  );

  const selectedSender = fromOptions.find((o) => o.id === senderId);
  const notifFace = senderFace(selectedSender);

  async function pickNotifPhoto() {
    if (!selectedSender?.isFo) return;
    if (!isPremium) {
      router.push({ pathname: '/paywall', params: { reason: 'notification-photo' } });
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      updateFo(selectedSender.id, { notifPhotoUri: await persistImage(res.assets[0].uri) });
    }
  }

  function clearNotifPhoto() {
    if (selectedSender?.isFo) updateFo(selectedSender.id, { notifPhotoUri: '' });
  }

  const filteredOptions = options.map(o => o.body.trim()).filter(Boolean);

  function pickStarter(presetName: string) {
    const list = STARTER_PRESETS[presetName];
    if (list && list.length > 0) {
      setOptions([{
        id: newId(),
        body: list[0],
        arrivalDay: 'everyday',
        customHour: 9,
        customMinute: 0,
        customAmPm: 'AM',
        customHourText: '9',
        customMinuteText: '00',
      }]);
    }
  }

  async function queue() {
    const filtered = options.filter(o => o.body.trim().length > 0);
    if (filtered.length === 0) return;

    const granted = await requestPermission();
    if (!granted) {
      setPendingQueue(filtered);
      setNotifDenied(true);
      return;
    }

    proceedWithQueue(filtered);
  }

  function proceedWithQueue(filtered: ComposeOption[]) {
    const queueData = filtered.map((opt) => {
      let resolvedHour = 9;
      let resolvedMinute = 0;
      if (opt.arrivalDay === 'now') {
        resolvedHour = -2;
      } else if (opt.arrivalDay === 'random') {
        // hour/minute are irrelevant for random — scheduling handled in foNotifications
        resolvedHour = -1;
      } else {
        const h = opt.customHour % 12;
        resolvedHour = opt.customAmPm === 'PM' ? h + 12 : h;
        resolvedMinute = opt.customMinute;
      }
      return {
        body: opt.body.trim(),
        hour: resolvedHour,
        minute: resolvedMinute,
        arrivalDay: opt.arrivalDay,
      };
    });

    onQueue(queueData, senderName.trim() || shipName, senderId);
  }

  const firstOpt = options[0];
  const hasContent = options.some(o => o.body.trim().length > 0);
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' } as const;
  let lockscreenDateText = '';
  let lockscreenTimeText = '';
  const now = new Date();

  if (firstOpt) {
    if (firstOpt.arrivalDay === 'now') {
      lockscreenDateText = now.toLocaleDateString('en-US', dateOptions);
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      lockscreenTimeText = `${hrs}:${mins}`;
    } else if (firstOpt.arrivalDay === 'random') {
      lockscreenDateText = now.toLocaleDateString('en-US', dateOptions);
      lockscreenTimeText = '🎁 surprise';
    } else {
      if (firstOpt.arrivalDay === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        lockscreenDateText = tomorrow.toLocaleDateString('en-US', dateOptions);
      } else {
        lockscreenDateText = now.toLocaleDateString('en-US', dateOptions);
      }

      const h = (firstOpt.customHour % 12) + (firstOpt.customAmPm === 'PM' ? 12 : 0);
      lockscreenTimeText = `${String(h).padStart(2, '0')}:${String(firstOpt.customMinute).padStart(2, '0')}`;
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={fo.compose} keyboardVerticalOffset={120}>
      <CozyModal
        visible={notifDenied}
        title="notifications off"
        message="Enable notifications in Settings to receive their nudges. Save to vault anyway?"
        confirmText="save anyway"
        cancelText="cancel"
        onConfirm={() => { setNotifDenied(false); if (pendingQueue) { proceedWithQueue(pendingQueue); setPendingQueue(null); } }}
        onClose={() => { setNotifDenied(false); setPendingQueue(null); }}
      />
      <ScrollView contentContainerStyle={fo.composeContent} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onScrollBeginDrag={() => Keyboard.dismiss()} showsVerticalScrollIndicator={false}>
        <Text style={fo.sectionLabel}>START WITH</Text>
        <View style={fo.starterRow}>
          {STARTERS.map((s) => (
            <Pressable
              key={s.text}
              style={fo.starter}
              onPress={() => pickStarter(s.text)}
            >
              <Text style={fo.starterEmoji}>{s.emoji}</Text>
              <Text style={fo.starterText} numberOfLines={2}>{s.text}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={fo.sectionLabel}>FROM</Text>
        <View style={fo.fromInputWrap}>
          <TextInput
            value={senderName}
            onChangeText={setSenderName}
            placeholder={shipName}
            placeholderTextColor={Colors.ink3}
            style={fo.fromInput}
          />
        </View>

        {/* The notification face is deliberately its own choice: the photo that
            suits a profile card is often not the one you want filling the lock
            screen. Empty falls back to the profile photo. */}
        {selectedSender?.isFo && (
          <>
            <Text style={fo.sectionLabel}>THEIR NOTIFICATION PHOTO</Text>
            <View style={fo.notifPhotoRow}>
              <View style={fo.notifPhotoPreview}>
                {notifFace ? (
                  <Image
                    source={{ uri: notifFace }}
                    style={fo.notifPhotoImg}
                    contentFit="cover"
                    {...AVATAR_IMAGE}
                  />
                ) : (
                  <Text style={fo.notifPhotoInitial}>
                    {senderName.trim().charAt(0).toUpperCase() || '♡'}
                  </Text>
                )}
              </View>
              <View style={fo.notifPhotoCol}>
                <Text style={fo.notifPhotoHint}>
                  {selectedSender.notifPhotoUri
                    ? 'a photo just for notifications'
                    : notifFace
                      ? 'using their profile photo'
                      : 'no photo — the app icon shows instead'}
                </Text>
                <View style={fo.notifPhotoBtns}>
                  {/* marked before it's tapped — a paywall you saw coming reads
                      as a locked feature, one you didn't reads as a bait */}
                  <Pressable
                    onPress={pickNotifPhoto}
                    style={[fo.notifPhotoBtn, !isPremium && fo.notifPhotoBtnLocked]}
                  >
                    <Text style={fo.notifPhotoBtnText}>
                      {selectedSender.notifPhotoUri ? 'change' : 'choose photo'}
                      {!isPremium ? ' ✦' : ''}
                    </Text>
                  </Pressable>
                  {!!selectedSender.notifPhotoUri && (
                    <Pressable onPress={clearNotifPhoto} style={fo.notifPhotoBtn}>
                      <Text style={fo.notifPhotoBtnText}>use profile photo</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          </>
        )}

        <Text style={fo.sectionLabel}>WHAT THEY MIGHT SEND</Text>
        {options.map((opt, index) => {
          const showAround = opt.arrivalDay !== 'now' && opt.arrivalDay !== 'random';
          return (
            <View
              key={opt.id}
              style={{
                backgroundColor: Colors.vellum,
                borderWidth: 1.2,
                borderColor: Colors.line,
                borderRadius: Radius.r3,
                padding: Spacing.s4,
                marginBottom: 16,
                gap: 12,
                position: 'relative',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(10), color: Colors.ink3, textTransform: 'uppercase', letterSpacing: 1 }}>
                  message option {index + 1}
                </Text>
                {options.length > 1 && (
                  <Pressable
                    onPress={() => {
                      setOptions(options.filter((_, i) => i !== index));
                    }}
                    style={{ padding: 4 }}
                  >
                    <Text style={{ color: Colors.ember, fontSize: sf(11), fontFamily: FontFamily.uiMedium }}>✕ Remove</Text>
                  </Pressable>
                )}
              </View>

              <View style={fo.msgInputWrap}>
                <TextInput
                  value={opt.body}
                  onChangeText={(val) => {
                    const copy = [...options];
                    copy[index] = { ...copy[index], body: val };
                    setOptions(copy);
                  }}
                  placeholder={`${senderName || shipName} says...`}
                  placeholderTextColor={Colors.ink3}
                  style={[fo.msgInput, { minHeight: 40 }]}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={{ borderTopWidth: 0.5, borderTopColor: Colors.line + '77', paddingTop: 8 }}>
                <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2, marginBottom: 8 }}>
                  WHEN SHOULD THIS ARRIVE?
                </Text>
                
                <View style={[fo.chipRow, { marginBottom: 8 }]}>
                  {ARRIVAL_DAYS.map((d) => (
                    <Pressable
                      key={d.id}
                      style={[
                        fo.chip,
                        opt.arrivalDay === d.id && { backgroundColor: Colors.paperDeep, borderColor: Colors.lineStrong },
                        { paddingVertical: 6, paddingHorizontal: 12 }
                      ]}
                      onPress={() => {
                        const copy = [...options];
                        copy[index] = { ...copy[index], arrivalDay: d.id };
                        setOptions(copy);
                      }}
                    >
                      <Text style={[
                        fo.chipText,
                        opt.arrivalDay === d.id && { color: Colors.ink, fontFamily: FontFamily.uiMedium },
                        { fontSize: sf(11) }
                      ]}>
                        {d.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {showAround && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2 }}>Time:</Text>
                    <View style={[fo.customTimeRow, { borderTopWidth: 0, paddingVertical: 0, marginTop: 0 }]}>
                      <TextInput
                        value={opt.customHourText}
                        onChangeText={(v) => {
                          const digits = v.replace(/\D/g, '');
                          const copy = [...options];
                          copy[index] = { ...copy[index], customHourText: digits };
                          const n = parseInt(digits, 10);
                          if (!isNaN(n) && n >= 1 && n <= 12) {
                            copy[index].customHour = n;
                          }
                          setOptions(copy);
                        }}
                        onBlur={() => {
                          const copy = [...options];
                          copy[index] = { ...copy[index], customHourText: String(copy[index].customHour).padStart(2, '0') };
                          setOptions(copy);
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        style={[fo.customTimeInput, { height: 32, width: 38, paddingVertical: 4, fontSize: sf(13) }]}
                        selectTextOnFocus
                        placeholder="9"
                        placeholderTextColor={Colors.ink3}
                      />
                      <Text style={[fo.customTimeSep, { fontSize: sf(18) }]}>:</Text>
                      <TextInput
                        value={opt.customMinuteText}
                        onChangeText={(v) => {
                          const digits = v.replace(/\D/g, '');
                          const copy = [...options];
                          copy[index] = { ...copy[index], customMinuteText: digits };
                          const n = parseInt(digits, 10);
                          if (!isNaN(n) && n >= 0 && n <= 59) {
                            copy[index].customMinute = n;
                          }
                          setOptions(copy);
                        }}
                        onBlur={() => {
                          const copy = [...options];
                          copy[index] = { ...copy[index], customMinuteText: String(copy[index].customMinute).padStart(2, '0') };
                          setOptions(copy);
                        }}
                        keyboardType="number-pad"
                        maxLength={2}
                        style={[fo.customTimeInput, { height: 32, width: 38, paddingVertical: 4, fontSize: sf(13) }]}
                        selectTextOnFocus
                        placeholder="00"
                        placeholderTextColor={Colors.ink3}
                      />
                      <Pressable
                        style={[fo.customTimeAmPm, { paddingVertical: 6, paddingHorizontal: 10 }]}
                        onPress={() => {
                          const copy = [...options];
                          copy[index] = { ...copy[index], customAmPm: copy[index].customAmPm === 'AM' ? 'PM' : 'AM' };
                          setOptions(copy);
                        }}
                      >
                        <Text style={[fo.customTimeAmPmText, { fontSize: sf(12) }]}>{opt.customAmPm}</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        <Pressable
          onPress={() => {
            if (!isPremium) {
              router.push({ pathname: '/paywall', params: { reason: 'fo-messages' } });
            } else {
              setOptions([...options, {
                id: newId(),
                body: '',
                arrivalDay: 'everyday',
                customHour: 9,
                customMinute: 0,
                customAmPm: 'AM',
                customHourText: '9',
                customMinuteText: '00',
              }]);
            }
          }}
          style={fo.addMsgBtn}
        >
          <IconPlus size={12} color={Colors.sakuraDeep} />
          <Text style={fo.addMsgBtnText}>Add another message option</Text>
        </Pressable>

        <Text style={fo.sectionLabel}>PREVIEW</Text>
        <MockPhoneTop>
          <LinearGradient
            colors={['#4a80f0', '#74b9ff']}
            style={[fo.lockscreenBg, filteredOptions.length > 1 && fo.lockscreenBgActive]}
          >
            {/* Status bar + Dynamic Island — pixel-perfect SVG */}
            <Svg width="100%" height={44} viewBox="0 0 906 102" preserveAspectRatio="xMidYMin meet">
              {/* Dynamic Island */}
              <Path d="M274.054 0H631.015V31.0902V31.9875C631.015 53.7501 613.373 71.3922 591.611 71.3922H314.75C292.274 71.3922 274.054 53.1721 274.054 30.6963V0Z" fill="black" />
              {/* Cellular bars */}
              <Path d="M709.317 52.9684C709.317 51.6965 710.29 50.6654 711.492 50.6654H713.667C714.868 50.6654 715.842 51.6965 715.842 52.9684V57.5744C715.842 58.8463 714.868 59.8773 713.667 59.8773H711.492C710.29 59.8773 709.317 58.8463 709.317 57.5744V52.9684Z" fill="white" />
              <Path d="M720.192 47.211C720.192 45.9391 721.166 44.908 722.367 44.908H724.542C725.743 44.908 726.717 45.9391 726.717 47.211V57.5744C726.717 58.8463 725.743 59.8773 724.542 59.8773H722.367C721.166 59.8773 720.192 58.8463 720.192 57.5744V47.211Z" fill="white" />
              <Path d="M731.067 39.1506C731.067 37.8787 732.041 36.8476 733.242 36.8476H735.417C736.618 36.8476 737.592 37.8787 737.592 39.1506V57.5744C737.592 58.8463 736.618 59.8773 735.417 59.8773H733.242C732.041 59.8773 731.067 58.8463 731.067 57.5744V39.1506Z" fill="white" />
              <Path d="M741.942 34.5446C741.942 33.2727 742.916 32.2416 744.117 32.2416H746.292C747.493 32.2416 748.467 33.2727 748.467 34.5446V57.5744C748.467 58.8463 747.493 59.8773 746.292 59.8773H744.117C742.916 59.8773 741.942 58.8463 741.942 57.5744V34.5446Z" fill="white" />
              {/* WiFi */}
              <Path fillRule="evenodd" clipRule="evenodd" d="M777.255 38.3918C782.936 38.392 788.399 40.6199 792.516 44.6151C792.826 44.9235 793.321 44.9196 793.627 44.6063L796.59 41.5536C796.745 41.3947 796.831 41.1794 796.83 40.9555C796.828 40.7316 796.74 40.5174 796.583 40.3604C785.778 29.7902 768.731 29.7902 757.926 40.3604C757.769 40.5173 757.68 40.7314 757.679 40.9553C757.678 41.1793 757.764 41.3946 757.918 41.5536L760.882 44.6063C761.187 44.9201 761.683 44.924 761.993 44.6151C766.111 40.6197 771.574 38.3917 777.255 38.3918ZM777.337 47.6079C780.458 47.6077 783.468 48.7918 785.781 50.9302C786.094 51.2337 786.587 51.2271 786.892 50.9153L789.852 47.8626C790.008 47.7024 790.094 47.4852 790.092 47.2595C790.09 47.0338 789.999 46.8184 789.84 46.6615C782.795 39.9723 771.885 39.9723 764.84 46.6615C764.681 46.8184 764.59 47.0339 764.588 47.2597C764.586 47.4855 764.673 47.7027 764.829 47.8626L767.788 50.9153C768.093 51.2271 768.586 51.2337 768.899 50.9302C771.211 48.7932 774.218 47.6092 777.337 47.6079ZM783.357 53.5665C783.361 53.7928 783.274 54.0111 783.116 54.1696L777.996 59.444C777.846 59.599 777.641 59.6862 777.428 59.6862C777.214 59.6862 777.009 59.599 776.859 59.444L771.738 54.1696C771.738 54.0109 771.493 53.7926 771.498 53.5663C771.502 53.3399 771.598 53.1256 771.763 52.9738C775.033 50.1507 779.822 50.1507 783.092 52.9738C783.257 53.1257 783.352 53.3401 783.357 53.5665Z" fill="white" />
              {/* Battery outline */}
              <Rect x="806.041" y="31.0901" width="57.5744" height="29.9387" rx="9.2119" fill="white" fillOpacity="0.4" />
              {/* Battery fill */}
              <Path d="M806.041 45.8292C806.041 40.67 806.041 38.0905 807.045 36.1199C807.929 34.3866 809.338 32.9774 811.071 32.0942C813.042 31.0901 815.621 31.0901 820.78 31.0901H854.404V61.0288H820.78C815.621 61.0288 813.042 61.0288 811.071 60.0248C809.338 59.1416 807.929 57.7324 807.045 55.999C806.041 54.0285 806.041 51.4489 806.041 46.2898V45.8292Z" fill="white" />
              {/* Battery nub */}
              <Path d="M864.767 41.4535C865.683 41.4535 866.562 41.9388 867.21 42.8026C867.858 43.6663 868.222 44.8379 868.222 46.0595C868.222 47.281 867.858 48.4526 867.21 49.3164C866.562 50.1801 865.683 50.6654 864.767 50.6654L864.767 46.0595V41.4535Z" fill="white" />
              {/* Battery 99% */}
              <Path d="M826.732 37.4363C830.488 37.4363 833.434 40.1126 833.434 45.8138V45.8363C833.434 51.2677 830.87 54.495 826.71 54.495C823.572 54.495 821.245 52.6395 820.739 50.0982L820.716 49.997H824.045L824.078 50.0982C824.472 51.1102 825.394 51.7962 826.699 51.7962C829.049 51.7962 830.083 49.4909 830.207 46.5335C830.207 46.4211 830.207 46.2974 830.207 46.1737H829.982C829.397 47.4219 828.048 48.5464 825.799 48.5464C822.639 48.5464 820.514 46.2974 820.514 43.2275V43.205C820.514 39.8877 823.078 37.4363 826.732 37.4363ZM826.732 46.0387C828.408 46.0387 829.701 44.8468 829.701 43.1713V43.1488C829.701 41.4508 828.408 40.1351 826.755 40.1351C825.113 40.1351 823.797 41.4283 823.797 43.0813V43.1038C823.797 44.813 825.034 46.0387 826.732 46.0387ZM842.475 37.4363C846.231 37.4363 849.177 40.1126 849.177 45.8138V45.8363C849.177 51.2677 846.613 54.495 842.453 54.495C839.315 54.495 836.988 52.6395 836.482 50.0982L836.459 49.997H839.788L839.821 50.0982C840.215 51.1102 841.137 51.7962 842.442 51.7962C844.792 51.7962 845.826 49.4909 845.95 46.5335C845.95 46.4211 845.95 46.2974 845.95 46.1737H845.725C845.14 47.4219 843.791 48.5464 841.542 48.5464C838.382 48.5464 836.257 46.2974 836.257 43.2275V43.205C836.257 39.8877 838.821 37.4363 842.475 37.4363ZM842.475 46.0387C844.151 46.0387 845.444 44.8468 845.444 43.1713V43.1488C845.444 41.4508 844.151 40.1351 842.498 40.1351C840.856 40.1351 839.54 41.4283 839.54 43.0813V43.1038C839.54 44.813 840.777 46.0387 842.475 46.0387Z" fill="black" />
            </Svg>

            {/* Centered open padlock below status bar */}
            <View style={{ alignSelf: 'center', marginTop: 2 }}>
              <OpenLockIcon size={14} color="#ffffff" />
            </View>

            <View style={fo.lockscreenClockContainer}>
              <Text style={fo.lockscreenDate}>{lockscreenDateText}</Text>
              <Text style={[
                fo.lockscreenTime,
                firstOpt?.arrivalDay === 'random' && { fontSize: sf(28), letterSpacing: 0 },
              ]}>{lockscreenTimeText}</Text>
            </View>

            <View style={[fo.notifStackContainer, filteredOptions.length > 1 && fo.notifStackActive]}>
              {filteredOptions.length > 1 && (
                <>
                  <View style={[fo.notifBanner, fo.notifCardBack2]} />
                  <View style={[fo.notifBanner, fo.notifCardBack1]} />
                </>
              )}
              <View style={fo.notifBanner}>
                <Image style={fo.notifIcon} source={require('@/assets/images/icon.png')} />
                <View style={fo.notifRight}>
                  <View style={fo.notifHeader}>
                    <Text style={fo.notifTitle} numberOfLines={1}>{senderName.trim() || shipName}</Text>
                    <Text style={fo.notifTime}>now</Text>
                  </View>
                  <Text style={fo.notifBody} numberOfLines={2}>{filteredOptions[0] || 'a message for you~'}</Text>
                </View>
              </View>
            </View>

          </LinearGradient>
        </MockPhoneTop>

        <Pressable
          style={[fo.queueBtn, !hasContent && fo.queueBtnDisabled]}
          onPress={queue}
          disabled={!hasContent}
        >
          <Text style={fo.queueBtnText}>Queue message ♡</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────


const fo = StyleSheet.create({
  // Hub
  wrap: { flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  hubHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: Spacing.s4, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3, marginBottom: Spacing.s3,
  },
  hubLeft: { gap: 2 },
  eyebrow: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4 },
  activeCount: { fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: Colors.ink },
  noSaved: { fontFamily: FontFamily.ja, fontSize: sf(11), color: Colors.ink3, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 12,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill,
  },
  newBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.sakuraDeep },

  emptyCard: {
    padding: Spacing.s5, backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    alignItems: 'flex-start', gap: Spacing.s3,
  },
  emptyCardText: { fontFamily: FontFamily.ja, fontSize: sf(12), color: Colors.ink3 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: Colors.sakuraSoft, borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill,
  },
  createBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.sakuraDeep },

  list: { gap: 12 },

  // Notification card
  msgCard: {
    paddingTop: Spacing.s5, paddingHorizontal: Spacing.s4, paddingBottom: Spacing.s4,
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    gap: 6, overflow: 'visible', position: 'relative',
  },
  msgCardOff: { opacity: 0.5 },
  msgCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  msgSender: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink, lineHeight: sf(18) },
  msgTime: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase' },
  msgBody: { fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink, lineHeight: sf(22) },
  msgBodyOff: { color: Colors.ink3 },
  msgVariation: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.sakuraDeep },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  actionBtn: {
    paddingVertical: 5, paddingHorizontal: 12, borderRadius: Radius.pill,
    backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.line,
  },
  actionBtnResume: { backgroundColor: Colors.sageSoft, borderColor: Colors.sage },
  actionBtnPause: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakura },
  actionBtnDelete: { borderColor: Colors.ember },
  actionBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2 },
  actionBtnTextResume: { color: Colors.sageDeep },
  actionBtnTextPause: { color: Colors.sakuraInk },
  actionBtnTextDelete: { color: Colors.ember },

  fromInputWrap: {
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, paddingHorizontal: Spacing.s3, paddingVertical: 10,
    marginBottom: 8,
  },
  fromInput: {
    fontFamily: FontFamily.script, fontSize: sf(15), color: Colors.ink, padding: 0,
  },
  notifPhotoInitial: { fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: '#fff' },

  notifPhotoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, padding: Spacing.s3, marginBottom: 8,
  },
  notifPhotoPreview: {
    width: 52, height: 52, borderRadius: Radius.pill,
    backgroundColor: Colors.sakura,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  notifPhotoImg: { width: 52, height: 52, borderRadius: Radius.pill },
  notifPhotoCol: { flex: 1, gap: 6 },
  notifPhotoHint: { fontFamily: FontFamily.ui, fontSize: sf(11), color: Colors.ink3, lineHeight: sf(15) },
  notifPhotoBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notifPhotoBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill,
    backgroundColor: Colors.paperDeep, borderWidth: 1, borderColor: Colors.line,
  },
  notifPhotoBtnLocked: { borderColor: Colors.butterDeep, backgroundColor: Colors.butter + '33' },
  notifPhotoBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.ink2 },

  // Compose
  compose: { flex: 1, backgroundColor: Colors.paper },
  composeContent: { paddingHorizontal: Spacing.s5, paddingBottom: Spacing.s9 },
  composeBack: { paddingVertical: Spacing.s3 },
  composeBackText: { fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink2 },

  sectionLabel: {
    fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3,
    letterSpacing: 1.4, marginTop: Spacing.s4, marginBottom: Spacing.s2,
  },
  starterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  starter: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill, ...Shadow.s1,
  },
  starterActive: { backgroundColor: Colors.sakuraSoft, borderColor: Colors.sakura },
  starterEmoji: { fontSize: sf(14) },
  starterText: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2 },

  msgInputWrap: {
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r3, padding: Spacing.s3,
  },
  msgInput: {
    fontFamily: FontFamily.script, fontSize: sf(16), color: Colors.ink,
    minHeight: 72, textAlignVertical: 'top', lineHeight: sf(24),
  },
  addMsgBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: 'rgba(243,182,196,0.15)', borderWidth: 1, borderColor: Colors.sakura,
    borderRadius: Radius.pill, marginTop: 4, marginBottom: Spacing.s4,
  },
  addMsgBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.sakuraDeep },
  customTimeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: Spacing.s2, marginBottom: Spacing.s2,
  },
  customTimeInput: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(24), color: Colors.ink,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.r2, paddingVertical: 8, paddingHorizontal: 14,
    textAlign: 'center', minWidth: 58,
  },
  customTimeSep: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(24), color: Colors.ink2,
  },
  customTimeAmPm: {
    backgroundColor: Colors.sakuraDeep, borderRadius: Radius.r2,
    paddingVertical: 8, paddingHorizontal: 14, marginLeft: 4,
  },
  customTimeAmPmText: {
    fontFamily: FontFamily.uiSemiBold, fontSize: sf(14), color: Colors.vellum,
  },

  notifBanner: {
    backgroundColor: 'rgba(20, 20, 22, 0.72)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
  },
  notifRight: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  notifTitle: {
    fontFamily: FontFamily.uiSemiBold,
    fontSize: sf(11),
    color: '#ffffff',
  },
  notifTime: {
    fontFamily: FontFamily.ui,
    fontSize: sf(11),
    color: 'rgba(255, 255, 255, 0.45)',
  },
  notifBody: {
    fontFamily: FontFamily.ui,
    fontSize: sf(10),
    color: 'rgba(255, 255, 255, 0.80)',
    lineHeight: sf(13),
  },

  lockscreenBg: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  lockscreenBgActive: {
    paddingBottom: 28,
  },
  lockscreenPadlock: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  lockscreenClockContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  lockscreenDate: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: sf(13),
    fontFamily: FontFamily.ui,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  lockscreenTime: {
    color: '#ffffff',
    fontSize: sf(64),
    fontFamily: FontFamily.ui,
    marginTop: 0,
    letterSpacing: -3,
  },

  notifStackContainer: {
    position: 'relative',
  },
  notifStackActive: {},
  notifCardBack1: {
    position: 'absolute',
    bottom: -6,
    left: 8,
    right: 8,
    height: 48,
    zIndex: -1,
    opacity: 0.6,
    borderTopWidth: 0,
  },
  notifCardBack2: {
    position: 'absolute',
    bottom: -12,
    left: 16,
    right: 16,
    height: 40,
    zIndex: -2,
    opacity: 0.35,
    borderTopWidth: 0,
  },

  lockscreenBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 12,
  },
  lockscreenCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 120,
    height: 4.5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2.25,
    alignSelf: 'center',
    marginTop: 16,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill,
  },
  chipActive: { backgroundColor: Colors.paperDeep, borderColor: Colors.lineStrong },
  chipText: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink2 },
  chipTextActive: { color: Colors.ink, fontFamily: FontFamily.uiMedium },

  previewRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.s4, paddingVertical: Spacing.s3,
    borderTopWidth: 1, borderTopColor: Colors.line,
  },
  previewLabel: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(13), color: Colors.ink },
  previewValue: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3 },

  queueBtn: {
    marginTop: Spacing.s4, backgroundColor: Colors.sakuraDeep,
    borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center',
  },
  queueBtnDisabled: { opacity: 0.4 },
  queueBtnText: { fontFamily: FontFamily.uiSemiBold, fontSize: sf(15), color: Colors.vellum },
});
