import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function LayoutAbas() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#00ff99',
                tabBarInactiveTintColor: '#888888',
                tabBarStyle: {
                    backgroundColor: '#101820',
                    borderTopColor: '#00aa66',
                },
                headerStyle: {
                    backgroundColor: '#101820',
                },
                headerTintColor: '#ffffff',
            }}
        >

            <Tabs.Screen
                name="home"
                options={{
                    title: 'Jogos',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome
                            name="gamepad"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="status"
                options={{
                    title: 'Meu Perfil',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome
                            name="user"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="config"
                options={{
                    title: 'Configurações',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome
                            name="cog"
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />

        </Tabs>
    );
}