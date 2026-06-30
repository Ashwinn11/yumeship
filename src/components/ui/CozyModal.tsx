import React from 'react';
import { Modal, StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { Button } from './Button';
import { Colors, FontFamily, Radius, Spacing, Shadow, SheetColumn ,sf } from '@/constants/theme';

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  isDestructive?: boolean;
  children?: React.ReactNode;
};

export function CozyModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  isDestructive = false,
  children,
}: Props) {
  const handleCancel = onCancel || onClose;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, SheetColumn]}>
              {title && <Text style={styles.title}>{title}</Text>}
              
              {message && <Text style={styles.description}>{message}</Text>}
              
              {children}
              
              <View style={styles.buttonRow}>
                {onConfirm ? (
                  <>
                    <Button
                      variant="outline"
                      onPress={handleCancel}
                      style={styles.btn}
                    >
                      {cancelText}
                    </Button>
                    <Button
                      variant="primary"
                      onPress={onConfirm}
                      style={isDestructive
                        ? { ...styles.btn, ...styles.destructiveBtn }
                        : styles.btn
                      }
                    >
                      {confirmText}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    onPress={onClose}
                    style={styles.singleBtn}
                  >
                    {confirmText || 'OK'}
                  </Button>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 26, 38, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.s5,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.vellum,
    borderWidth: 2,
    borderColor: Colors.ink,
    borderRadius: Radius.r4,
    padding: Spacing.s5,
    gap: Spacing.s4,
    ...Shadow.s2,
  },
  title: {
    fontFamily: FontFamily.displayItalic,
    fontSize: sf(22),
    color: Colors.ink,
    textAlign: 'center',
  },
  description: {
    fontFamily: FontFamily.ui,
    fontSize: sf(13),
    color: Colors.ink2,
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.s3,
    marginTop: Spacing.s2,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'auto',
  },
  destructiveBtn: {
    backgroundColor: Colors.ember,
    borderColor: Colors.ember,
  },
  singleBtn: {
    width: '100%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'auto',
  },
});
