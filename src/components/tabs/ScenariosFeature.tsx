import { useMemo, useState } from 'react';
import { useIPad } from '@/hooks/use-ipad';
import {
  Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View,
} from 'react-native';

import { StickerSakuraBranch, WashiTape } from '@/components/deco';

import { CozyModal } from '@/components/ui/CozyModal';
import { DismissKeyboardView } from '@/components/ui/DismissKeyboardView';
import { IconPlus, IconTrashSolid } from '@/components/ui/Icon';
import {
  Colors, FontFamily, FontSize, Radius, RelationshipBase, RelationshipColors, RelationshipSoft,
  relationshipTypeOr, Shadow, SheetColumn, Spacing, sf,
} from '@/constants/theme';
import {
  addScenario, deleteScenario, updateScenario, useScenarios,
} from '@/store/scenarios';
import {
  addCustomPrompt, deleteCustomPrompt, getBuiltinDeck, useCustomPrompts,
  type CustomPrompt,
} from '@/store/scenarioPrompts';
import { useShip } from '@/store/ships';

// ─── Scenarios feature ────────────────────────────────────────────────────────


export function ScenariosFeature({ shipId, shipName, setCustomBack }: { shipId: string; shipName: string; setCustomBack: (fn: (() => void) | null) => void }) {
  const { column } = useIPad();
  const scenarios = useScenarios(shipId);
  const ship = useShip(shipId);
  const customPrompts = useCustomPrompts();
  const [editing, setEditing] = useState<{ id: string | null; title: string; body: string; prompt?: string } | null>(null);
  const [scDeleteTarget, setScDeleteTarget] = useState<string | null>(null);
  const [showIdeas, setShowIdeas] = useState(false);
  const [newPromptText, setNewPromptText] = useState('');
  const [shuffleN, setShuffleN] = useState(0);

  // Relationship type drives the whole screen's accent — keeps the design tied
  // to the ship and consistent with the relationship-aware prompts.
  const relType = relationshipTypeOr(ship?.relType);
  const accent = RelationshipColors[relType];
  const accentSoft = RelationshipSoft[relType];
  const accentLight = RelationshipBase[relType];

  const builtinDeck = getBuiltinDeck(ship?.relType);
  // Built-in (relationship-aware) + the user's own prompts, shuffled for serendipity.
  const ideaDeck = useMemo(() => {
    const all = [...builtinDeck, ...customPrompts];
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleN, customPrompts.length, ship?.relType]);

  function handleNewScenario(title = '', body = '', prompt = '') {
    setEditing({ id: null, title, body, prompt });
    setCustomBack(() => () => { setEditing(null); setCustomBack(null); });
  }

  function addPrompt() {
    const t = newPromptText.trim();
    if (!t) return;
    addCustomPrompt(t);
    setNewPromptText('');
  }

  if (editing) {
    return (
      <ScenarioEditor
        initial={editing}
        accent={accent}
        accentLight={accentLight}
        onSave={(title, body) => {
          if (!editing.id) addScenario(shipId, title, body);
          else updateScenario(editing.id, { title, body });
          setEditing(null);
          setCustomBack(null);
        }}
        onDelete={editing.id ? () => { deleteScenario(editing.id!); setEditing(null); setCustomBack(null); } : undefined}
      />
    );
  }

  return (
    <View style={sc.wrap}>
      {/* Redesigned Scenarios Header */}
      <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14, paddingHorizontal: 4 }, column]}>
        <View>
          <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: accent, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 }}>
            SCENARIOS · {scenarios.length} SAVED
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={() => setShowIdeas(true)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 4,
              height: 32, paddingHorizontal: 12, borderRadius: 16,
              backgroundColor: accentSoft, borderWidth: 1, borderColor: accentLight,
            }}
          >
            <Text style={{ fontSize: sf(12) }}>✨</Text>
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(12), color: accent }}>prompts</Text>
          </Pressable>
          <Pressable
            onPress={() => handleNewScenario()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: accent,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: 'rgba(110, 58, 90, 0.18)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <IconPlus size={13} color={Colors.vellum} />
          </Pressable>
        </View>
      </View>

      {scenarios.length === 0 ? (
        <ScrollView contentContainerStyle={[{ flexGrow: 1, justifyContent: 'center', paddingTop: 28, paddingHorizontal: 20, paddingBottom: Spacing.s9 }, column]} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <StickerSakuraBranch size={76} />
            <Text style={{ fontFamily: FontFamily.displayItalic, fontSize: sf(30), color: Colors.ink, textAlign: 'center', marginTop: 8 }}>
              no daydreams yet
            </Text>
            <Text style={{ fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3, textAlign: 'center' }}>
              pick a moment to write about, or start blank
            </Text>
          </View>

          {/* Prompt starters — tapping one names the new moment */}
          <View style={{ width: '100%', gap: 8, marginTop: Spacing.s5 }}>
            {builtinDeck.slice(0, 3).map((p) => (
              <Pressable
                key={p.text}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                  backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
                  borderLeftWidth: 3, borderLeftColor: accent,
                  borderRadius: Radius.r3, paddingVertical: 12, paddingHorizontal: 14,
                }}
                onPress={() => handleNewScenario(p.text)}
              >
                <Text style={{ fontSize: sf(13), color: accent }}>♡</Text>
                <Text style={{ flex: 1, fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: sf(19), color: Colors.ink2 }}>{p.text}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: Spacing.s4 }}>
            <Pressable
              onPress={() => handleNewScenario()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: accent, paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.pill }}
            >
              <IconPlus size={12} color={Colors.vellum} />
              <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum }}>start blank</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowIdeas(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill, borderWidth: 1, borderColor: accentLight, backgroundColor: accentSoft }}
            >
              <Text style={{ fontSize: sf(12) }}>✨</Text>
              <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: accent }}>more prompts</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <View style={[sc.list, column]}>
          <CozyModal
            visible={!!scDeleteTarget}
            title="delete this scene?"
            message={scenarios.find((s) => s.id === scDeleteTarget)?.title || 'this scenario'}
            confirmText="Delete"
            cancelText="keep it"
            isDestructive
            onConfirm={() => { if (scDeleteTarget) deleteScenario(scDeleteTarget); setScDeleteTarget(null); }}
            onClose={() => setScDeleteTarget(null)}
          />
          {scenarios.map((s, scIdx) => {
            const scDate = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
            const tapePattern = (scIdx % 2 === 0 ? 'dot' : 'floral') as any;
            const tapeColor = scIdx % 2 === 0 ? Colors.sakura : Colors.lavender;

            return (
              <Pressable
                key={s.id}
                onPress={() => {
                  setEditing({ id: s.id, title: s.title, body: s.body });
                  setCustomBack(() => () => { setEditing(null); setCustomBack(null); });
                }}
                style={[
                  sc.card,
                  {
                    position: 'relative',
                    overflow: 'visible',
                    backgroundColor: Colors.vellum,
                    borderColor: Colors.line,
                    borderRadius: 14,
                    padding: 16,
                    shadowColor: 'rgba(110, 58, 90, 0.06)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    elevation: 1,
                    borderWidth: 1,
                    marginVertical: 6,
                    flexDirection: 'column',
                  }
                ]}
              >
                {/* horizontal washi tape centered at top edge */}
                <View style={{ position: 'absolute', top: -7, left: '50%', transform: [{ translateX: -35 }], zIndex: 10 }}>
                  <WashiTape width={70} height={14} pattern={tapePattern} color={tapeColor} rotate={0} />
                </View>

                <View style={{ flex: 1, width: '100%', paddingVertical: 4 }}>
                  {/* title row */}
                  <View style={sc.cardTitleRow}>
                    <Text style={[sc.cardTitle, { fontFamily: FontFamily.uiSemiBold, fontSize: sf(16), textTransform: 'none', color: Colors.ink }]} numberOfLines={2}>
                      {s.title || 'untitled'}
                    </Text>
                    <Pressable hitSlop={8} onPress={() => setScDeleteTarget(s.id)}>
                      <IconTrashSolid size={12} color={Colors.ink3} />
                    </Pressable>
                  </View>

                  {/* body preview — Fredoka, matches the editor */}
                  {s.body ? (
                    <Text style={[sc.cardPreview, { fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: sf(19), color: Colors.ink2, marginTop: 4 }]} numberOfLines={3}>
                      {s.body}
                    </Text>
                  ) : (
                    <Text style={[sc.cardEmpty, { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink3, marginTop: 4 }]}>tap to write...</Text>
                  )}

                  {/* date at bottom right */}
                  <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: accent, letterSpacing: 1, textAlign: 'right', marginTop: 10 }}>
                    {scDate}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          <View style={{ height: Spacing.s9 }} />
        </View>
      )}

      {/* Ideas — browsable, relationship-aware prompt deck + your own */}
      <Modal visible={showIdeas} transparent animationType="slide" onRequestClose={() => setShowIdeas(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}
        >
        <TouchableWithoutFeedback onPress={() => setShowIdeas(false)}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        </TouchableWithoutFeedback>
        <DismissKeyboardView style={[{ backgroundColor: Colors.paper, borderTopLeftRadius: Radius.r5, borderTopRightRadius: Radius.r5, paddingBottom: 34, maxHeight: '80%' }, SheetColumn]}>
          <View style={{ width: 40, height: 4, backgroundColor: Colors.line, borderRadius: 2, alignSelf: 'center', marginTop: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.s5, paddingTop: Spacing.s3 }}>
            <Text style={{ fontFamily: FontFamily.uiSemiBold, fontSize: sf(18), color: Colors.ink }}>prompts</Text>
            <Pressable onPress={() => setShowIdeas(false)} hitSlop={8}>
              <Text style={{ fontSize: sf(13), color: Colors.ink3 }}>✕</Text>
            </Pressable>
          </View>
          <Text style={{ fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink3, paddingHorizontal: Spacing.s5, marginTop: 2 }}>
            tap one to name a new moment · {shipName}
          </Text>

          {/* add your own — so you never run out */}
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.s5, marginTop: Spacing.s3 }}>
            <TextInput
              value={newPromptText}
              onChangeText={setNewPromptText}
              placeholder="add your own prompt…"
              placeholderTextColor={Colors.ink3}
              style={{ flex: 1, height: 40, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill, paddingHorizontal: 14, fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink, backgroundColor: Colors.vellum }}
              onSubmitEditing={addPrompt}
              returnKeyType="done"
            />
            <Pressable
              onPress={addPrompt}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: accent, alignItems: 'center', justifyContent: 'center' }}
            >
              <IconPlus size={14} color={Colors.vellum} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ gap: 8, padding: Spacing.s5 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={() => Keyboard.dismiss()}
          >
            {ideaDeck.map((p, i) => {
              const isCustom = 'id' in p;
              return (
                <View
                  key={(isCustom ? (p as CustomPrompt).id : 'b') + i}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    backgroundColor: isCustom ? Colors.lavenderSoft : Colors.vellum,
                    borderWidth: 1, borderColor: isCustom ? Colors.lavender : Colors.line,
                    borderLeftWidth: 3, borderLeftColor: isCustom ? Colors.lavenderDeep : accent,
                    borderRadius: Radius.r3, paddingVertical: 12, paddingHorizontal: 14,
                  }}
                >
                  <Pressable
                    onPress={() => { handleNewScenario(p.text); setShowIdeas(false); }}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
                  >
                    <Text style={{ fontSize: sf(13), color: isCustom ? Colors.lavenderDeep : accent }}>{isCustom ? '✎' : '♡'}</Text>
                    <Text style={{ flex: 1, fontFamily: FontFamily.ui, fontSize: sf(13), lineHeight: sf(19), color: Colors.ink }}>{p.text}</Text>
                  </Pressable>
                  {isCustom && (
                    <Pressable hitSlop={8} onPress={() => deleteCustomPrompt((p as CustomPrompt).id)}>
                      <Text style={{ fontSize: sf(12), color: Colors.ink3 }}>✕</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={() => setShuffleN((n) => n + 1)}
            style={{ alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, marginTop: 2 }}
          >
            <Text style={{ fontSize: sf(13), color: accent }}>↻</Text>
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: accent }}>shuffle prompts</Text>
          </Pressable>
        </DismissKeyboardView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function ScenarioEditor({ initial, accent, accentLight, onSave, onDelete }: {
  initial: { id: string | null; title: string; body: string; prompt?: string };
  accent: string;
  accentLight: string;
  onSave: (title: string, body: string) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[sc.editor, { backgroundColor: Colors.paper }]} keyboardVerticalOffset={120}>
      <CozyModal
        visible={confirmDelete}
        title="delete this scene?"
        confirmText="Delete"
        cancelText="keep it"
        isDestructive
        onConfirm={() => { setConfirmDelete(false); onDelete?.(); }}
        onClose={() => setConfirmDelete(false)}
      />

      {/* Cozy Custom Editor Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: Colors.line,
          backgroundColor: Colors.paper,
        }}
      >
        <Text style={{ fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          writing what-if
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {onDelete && (
            <Pressable hitSlop={8} onPress={() => setConfirmDelete(true)}>
              <Text style={{ fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ember }}>delete</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => onSave(title, body)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 18,
              backgroundColor: accent,
              borderRadius: 99,
              shadowColor: 'rgba(110, 58, 90, 0.18)',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text style={{ fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum }}>save</Text>
          </Pressable>
        </View>
      </View>

      {/* Writing Paper Sheet Container */}
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.vellum,
          margin: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.line,
          position: 'relative',
          overflow: 'visible',
          shadowColor: 'rgba(110, 58, 90, 0.05)',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        {/* Horizontal washi tape overlapping top edge */}
        <View style={{ position: 'absolute', top: -7, left: '50%', transform: [{ translateX: -35 }], zIndex: 10 }}>
          <WashiTape width={70} height={14} pattern="dot" color={accentLight} rotate={0} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 18, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <DismissKeyboardView style={{ flex: 1 }}>
            {/* Moment name — Fredoka (matches body, easier on the eyes) */}
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="give this moment a name..."
              placeholderTextColor={Colors.ink3}
              multiline
              style={{
                fontFamily: FontFamily.uiSemiBold,
                fontSize: sf(18),
                color: Colors.ink,
                borderBottomWidth: 1,
                borderBottomColor: accentLight,
                paddingVertical: 8,
                marginBottom: 12,
              }}
            />

            {/* Body Input — Cursive Caveat script font */}
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="what happens in this scene..."
              placeholderTextColor={Colors.ink3}
              style={{
                fontFamily: FontFamily.ui,
                fontSize: sf(15),
                color: Colors.ink2,
                lineHeight: sf(24),
                flex: 1,
                minHeight: 260,
                textAlignVertical: 'top',
              }}
              multiline
              textAlignVertical="top"
              autoFocus={!initial.body}
            />
          </DismissKeyboardView>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}


const sc = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: Spacing.s5, paddingTop: Spacing.s4, paddingBottom: Spacing.s6 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.s4 },
  eyebrow: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 1.4 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 12,
    backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill,
  },
  newBtnText: { fontFamily: FontFamily.uiMedium, fontSize: sf(11), color: Colors.vellum },

  empty: { alignItems: 'center', gap: Spacing.s3, paddingVertical: Spacing.s7, paddingHorizontal: Spacing.s4 },
  emptyTitle: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.h5, color: Colors.ink },
  emptySub: { fontFamily: FontFamily.displayItalic, fontSize: FontSize.meta, color: Colors.ink2, textAlign: 'center', lineHeight: 20 },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: Spacing.s2 },
  prompt: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 14,
    backgroundColor: Colors.vellum, borderWidth: 1, borderColor: Colors.line,
    borderRadius: Radius.pill, ...Shadow.s1,
  },
  promptJa: { fontFamily: FontFamily.ja, fontSize: sf(14), color: Colors.sakuraDeep },
  promptLabel: { fontFamily: FontFamily.ui, fontSize: sf(12), color: Colors.ink2 },

  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.r3,
    overflow: 'hidden', ...Shadow.s1,
  },
  cardStripe: { width: 4, backgroundColor: Colors.sakura },
  cardBody: { flex: 1, padding: Spacing.s4, gap: 3 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  cardTitle: { fontFamily: FontFamily.displayItalic, fontSize: sf(16), color: Colors.ink, flex: 1 },
  cardPreview: { fontFamily: FontFamily.script, fontSize: sf(14), color: Colors.ink2, lineHeight: sf(20) },
  cardEmpty: { fontFamily: FontFamily.displayItalic, fontSize: sf(13), color: Colors.ink3 },
  cardDate: { fontFamily: FontFamily.marker, fontSize: sf(9), color: Colors.ink3, letterSpacing: 0.5, marginTop: 4 },

  editor: { flex: 1, backgroundColor: Colors.paper },
  editorBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.s4, paddingVertical: Spacing.s3,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  barBackBtn: {
    width: 32, height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.vellum,
    borderWidth: 1, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  barBack: { fontFamily: FontFamily.ui, fontSize: sf(14), color: Colors.ink2 },
  barWords: { fontFamily: FontFamily.ja, fontSize: sf(11), color: Colors.ink3, letterSpacing: 0.5 },
  barDelete: { fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ember },
  barSave: { paddingVertical: 5, paddingHorizontal: 16, backgroundColor: Colors.sakuraDeep, borderRadius: Radius.pill },
  barSaveText: { fontFamily: FontFamily.uiMedium, fontSize: sf(13), color: Colors.vellum },
  titleInput: {
    paddingHorizontal: Spacing.s5, paddingTop: Spacing.s5, paddingBottom: Spacing.s4,
    fontFamily: FontFamily.displayItalic, fontSize: sf(22), color: Colors.ink,
    borderBottomWidth: 1.5, borderBottomColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  bodyWrap: {
    flex: 1,
    backgroundColor: Colors.vellum,
    margin: Spacing.s4,
    borderRadius: Radius.r3,
    borderWidth: 1,
    borderColor: Colors.line,
    ...Shadow.s1,
  },
  bodyInput: {
    flex: 1, padding: Spacing.s4,
    fontFamily: FontFamily.script, fontSize: sf(15), color: Colors.ink, lineHeight: sf(26),
    minHeight: 260,
  },
});

