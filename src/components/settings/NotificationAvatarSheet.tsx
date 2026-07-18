import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CozyModal } from '@/components/ui/CozyModal';
import { Colors, FontFamily, Radius, sf } from '@/constants/theme';
import { useFos } from '@/store/fo';

type Props = {
  visible: boolean;
  onClose: () => void;
  currentUri: string;
  onSelect: (uri: string) => void;
};

// F/O message notifications are meant to look like they're from that F/O —
// there's deliberately no "use my own photo" option here, only F/O photos,
// the app icon default, or a manual pick from the library.
export function NotificationAvatarSheet({ visible, onClose, currentUri, onSelect }: Props) {
  const fos = useFos().filter((f) => !!f.photoUri);

  async function pickFromLibrary() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as ImagePicker.MediaType[],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!res.canceled && res.assets[0]) {
      onSelect(res.assets[0].uri);
      onClose();
    }
  }

  function choose(uri: string) {
    onSelect(uri);
    onClose();
  }

  return (
    <CozyModal visible={visible} title="Notification photo" onClose={onClose} confirmText="Cancel">
      <View style={styles.list}>
        <Row
          label="App icon (default)"
          source={require('@/assets/images/icon.png')}
          active={!currentUri}
          onPress={() => choose('')}
        />
        {fos.map((f) => (
          <Row
            key={f.id}
            label={`${f.name || 'their'} photo`}
            uri={f.photoUri}
            active={currentUri === f.photoUri}
            onPress={() => choose(f.photoUri)}
          />
        ))}
        <Row label="Choose from library…" onPress={pickFromLibrary} />
      </View>
    </CozyModal>
  );
}

function Row({
  label, uri, source, active, onPress,
}: {
  label: string; uri?: string; source?: number; active?: boolean; onPress: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {uri ? (
        <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
      ) : source ? (
        <Image source={source} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={styles.thumbPlaceholder} />
      )}
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>{label}</Text>
      {active && <Text style={styles.check}>✓</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8, marginTop: 8, marginBottom: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: Radius.r3, backgroundColor: Colors.paperDeep,
  },
  thumb: { width: 32, height: 32, borderRadius: Radius.pill },
  thumbPlaceholder: { width: 32, height: 32, borderRadius: Radius.pill, backgroundColor: Colors.line },
  label: { flex: 1, fontFamily: FontFamily.ui, fontSize: sf(13), color: Colors.ink },
  labelActive: { fontFamily: FontFamily.uiMedium, color: Colors.sakuraDeep },
  check: { color: Colors.sakuraDeep, fontSize: sf(14) },
});
