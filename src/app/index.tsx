import { Redirect } from 'expo-router';
import { getAllShips } from '@/store/ships';

export default function Index() {
  const hasShips = getAllShips().length > 0;
  return <Redirect href={hasShips ? '/(tabs)' : '/onboarding'} />;
}
