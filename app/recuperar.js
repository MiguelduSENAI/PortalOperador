import { useState } from 'react';

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';

import { useRouter } from 'expo-router';

import api from '../services/api';

import { styles } from './index';

export default function TelaRecuperar() {
    const [email, setEmail] = useState('');

    const router = useRouter();

    const solicitarNovaSenha = async () => {
        // Verifica se o campo está vazio
        if (!email.trim()) {
            return Alert.alert(
                'Erro',
                'Por favor, informe seu e-mail cadastrado.'
            );
        }

        try {
            console.log('Enviando solicitação para:', email);

            // Envia o e-mail para o backend
            const res = await api.post('/recuperar', {
                email: email.trim(),
            });

            console.log('Resposta do servidor:', res.data);

            Alert.alert(
                'Solicitação Enviada',
                res.data.message,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setEmail('');
                            router.replace('/');
                        },
                    },
                ]
            );

        } catch (erro) {
            console.error('ERRO AO RECUPERAR SENHA:', erro);

            if (erro.response) {
                Alert.alert(
                    'Erro',
                    erro.response.data.error || 'Não foi possível realizar a solicitação.'
                );
            } else {
                Alert.alert(
                    'Erro de Conexão',
                    'Não foi possível conectar ao servidor.'
                );
            }
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 20,
                    paddingTop: 40,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>

                    <Text style={styles.titulo}>
                        Recuperar Conta
                    </Text>

                    <Text
                        style={{
                            marginBottom: 20,
                            textAlign: 'center',
                            color: '#ffffff',
                        }}
                    >
                        Informe seu e-mail cadastrado para solicitar a recuperação da sua conta gamer.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="E-mail cadastrado"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={setEmail}
                    />

                    <TouchableOpacity
                        style={styles.botao}
                        onPress={solicitarNovaSenha}
                    >
                        <Text style={styles.botaoTexto}>
                            SOLICITAR AO RH
                        </Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}