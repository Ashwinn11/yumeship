// Widget data bridge — writes to shared App Group so widgets can read it
// Only runs when expo-widgets is available (dev build / production, not Expo Go)

let Widget: any = null;
try {
  // expo-widgets is not available in Expo Go — guard with try/catch
  Widget = require('expo-widgets').Widget;
} catch {
  Widget = null;
}

type AnniversaryWidgetData = {
  foName: string;
  daysUntil: number;
  title: string;
};

type HeadcanonWidgetData = {
  foName: string;
  headcanon: string;
};

export function updateAnniversaryWidget(data: AnniversaryWidgetData) {
  if (!Widget) return;
  Widget.updateSnapshot('AnniversaryWidget', data);
}

export function updateHeadcanonTimeline(entries: Array<{ date: Date; data: HeadcanonWidgetData }>) {
  if (!Widget) return;
  Widget.updateTimeline('HeadcanonWidget', entries.map((e) => ({
    date: e.date,
    props: e.data,
  })));
}

export function reloadAllWidgets() {
  if (!Widget) return;
  Widget.reload('AnniversaryWidget');
  Widget.reload('HeadcanonWidget');
}
