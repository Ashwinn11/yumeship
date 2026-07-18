// Stripe colors verified against flagcolorcodes.com + Human Rights Campaign's
// pride flag reference. `colors` omitted = no standardized flag (rendered as
// plain text, no stripe icon) rather than guessing at one.
export type SexualityOption = { key: string; label: string; colors?: string[] };

export const SEXUALITY_OPTIONS: SexualityOption[] = [
  { key: 'gay', label: 'Gay', colors: ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004CFF', '#732982'] },
  { key: 'lesbian', label: 'Lesbian', colors: ['#D52D00', '#EF7627', '#FF9A56', '#FFFFFF', '#D162A4', '#B55690', '#A30262'] },
  { key: 'bisexual', label: 'Bisexual', colors: ['#D60270', '#9B4F96', '#0038A8'] },
  { key: 'pansexual', label: 'Pansexual', colors: ['#FF218C', '#FFD800', '#21B1FF'] },
  { key: 'asexual', label: 'Asexual', colors: ['#000000', '#A3A3A3', '#FFFFFF', '#800080'] },
  { key: 'aromantic', label: 'Aromantic', colors: ['#3DA542', '#A7D379', '#FFFFFF', '#A9A9A9', '#000000'] },
  { key: 'polysexual', label: 'Polysexual', colors: ['#F714BA', '#01D66A', '#1594F6'] },
  { key: 'omnisexual', label: 'Omnisexual', colors: ['#FE9ACE', '#FF53BF', '#200044', '#6760FE', '#8EA6FF'] },
  { key: 'queer', label: 'Queer', colors: ['#E40303', '#FF8C00', '#FFED00', '#008026', '#004CFF', '#732982'] },
  { key: 'straight', label: 'Straight' },
  { key: 'questioning', label: 'Questioning' },
];

export function findSexualityOption(label: string): SexualityOption | undefined {
  return SEXUALITY_OPTIONS.find((o) => o.label === label);
}
