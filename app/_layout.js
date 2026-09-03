import { Stack } from 'expo-router';

export default function LayoutRaiz() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Acesso Para Conhecer os jogos' }}
      />

      <Stack.Screen
        name="cadastro"
        options={{ title: 'Novo Cadastro' }}
      />

      <Stack.Screen
        name="recuperar"
        options={{ title: 'Recuperar Senha' }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}