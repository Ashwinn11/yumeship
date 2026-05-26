import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, Radius } from '@/constants/theme';

type Props = {
  value: string;           // stored as "YYYY-MM-DD"
  onChange: (v: string) => void;
  editing?: boolean;
  placeholder?: string;
  style?: object;
  textStyle?: object;
  /** If true, show formatted as "MMM DD" (birthday). Default shows "YYYY.MM.DD" */
  format?: 'birthday' | 'full';
  displayValue?: string;
};

function parseDate(v: string): Date | null {
  if (!v) return null;
  const clean = v.replace(/\./g, '-');
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

function formatDisplay(v: string, format: 'birthday' | 'full'): string {
  const d = parseDate(v);
  if (!d) return '';
  if (format === 'birthday') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export function calcElapsed(dateStr: string): { label: string; since: string } | null {
  const d = parseDate(dateStr);
  if (!d) return null;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return null;
  const totalDays = Math.floor(diffMs / 86400000);
  const years = Math.floor(totalDays / 365);
  const days = totalDays % 365;
  const label = years > 0 ? `${years}y ${days}d` : `${totalDays}d`;
  const since = formatDisplay(dateStr, 'full');
  return { label, since };
}

export function DateField({ value, onChange, editing, placeholder = 'pick a date', style, textStyle, format = 'full', displayValue }: Props) {
  const [open, setOpen] = useState(false);
  const display = displayValue !== undefined ? displayValue : formatDisplay(value, format);
  const date = parseDate(value) ?? new Date();

  return (
    <>
      <Pressable
        onPress={editing ? () => setOpen(true) : undefined}
        style={[styles.pill, style]}
        disabled={!editing}
      >
        <Text style={[styles.text, !display && styles.placeholder, textStyle]}>
          {display || placeholder}
        </Text>
      </Pressable>

      {open && (
        <Modal transparent animationType="fade">
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <View style={styles.sheet} onStartShouldSetResponder={() => true}>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                themeVariant="light"
                textColor="#1f1219"
                onValueChange={(_, selected) => {
                  if (selected) {
                    const y = selected.getFullYear();
                    const m = String(selected.getMonth() + 1).padStart(2, '0');
                    const d = String(selected.getDate()).padStart(2, '0');
                    onChange(`${y}-${m}-${d}`);
                  }
                }}
                />
              <Pressable style={styles.doneBtn} onPress={() => setOpen(false)}>
                <Text style={styles.doneBtnText}>done ♡</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 20,
    borderWidth: 1.5,
    borderColor: '#1f1219',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontFamily: FontFamily.ja,
    fontSize: 11,
    color: '#1f1219',
  },
  placeholder: {
    color: '#1f121944',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  doneBtn: {
    marginHorizontal: 24,
    marginTop: 4,
    backgroundColor: Colors.sakuraDeep,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: FontFamily.markerBold,
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
