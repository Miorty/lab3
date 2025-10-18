import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen //определяет каждый экран приложения
        name="index"
        options={{
          title: 'Карта маркеров',
        }}
      />
      <Stack.Screen
        name="marker/[id]"
        options={{
          title: 'Детали маркера',
        }}
      />
    </Stack>
  );
}

