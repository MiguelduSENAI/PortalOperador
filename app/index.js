import { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert
} from 'react-native';

import { Link, useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Haptics from 'expo-haptics';

import { useNetInfo } from '@react-native-community/netinfo';

import api from '../services/api';

export default function TelaLogin() {

  const router = useRouter();

  const netInfo = useNetInfo();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const fazerLogin = async () => {

    if (!email || !senha) {

      Alert.alert(
        'Atenção',
        'Preencha e-mail e senha!'
      );

      return;
    }

    if (netInfo.isConnected === false) {

      Alert.alert(
        'Sem conexão',
        '⚠️ Dispositivo Offline. Verifique sua conexão com a rede da fábrica.'
      );

      return;
    }

    await Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    );

    try {

      const resposta = await api.post('/login', {
        email,
        senha
      });

      // SALVANDO O ID DO USUÁRIO NA MEMÓRIA DO CELULAR
      const idDoUsuario = resposta.data.id;

      await AsyncStorage.setItem(
        'usuarioId',
        String(idDoUsuario)
      );

      Alert.alert(
        'Sucesso',
        resposta.data.mensagem
      );

      router.replace('/(tabs)/home');

    } catch (erro) {

      console.error(erro);

      if (erro.response) {

        Alert.alert(
          'Acesso Negado',
          erro.response.data.mensagem
        );

      } else {

        Alert.alert(
          'Erro',
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
          paddingTop: 40
        }}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.container}>

          {/* AVISO DE DISPOSITIVO OFFLINE */}

          {netInfo.isConnected === false && (

            <View style={styles.bannerOffline}>

              <Text style={styles.textoOffline}>
                ⚠️ Dispositivo Offline. Verifique sua conexão com a rede da fábrica.
              </Text>

            </View>

          )}

          <Text style={styles.titulo}>
            Portal Gamer
          </Text>

          <Text style={styles.subtitulo}>
            Notícias, dicas e informações dos seus jogos favoritos
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity
            style={[
              styles.botao,
              netInfo.isConnected === false &&
              styles.botaoDesabilitado
            ]}
            onPress={fazerLogin}
            disabled={netInfo.isConnected === false}
          >

            <Text style={styles.botaoTexto}>

              {netInfo.isConnected === false
                ? 'SEM CONEXÃO'
                : 'ENTRAR'}

            </Text>

          </TouchableOpacity>

          <View style={styles.linksContainer}>

            <Link
              href="/cadastro"
              style={styles.linkText}
            >
              Criar conta
            </Link>

            <Link
              href="/recuperar"
              style={styles.linkText}
            >
              Recuperar senha
            </Link>

          </View>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>

  );
}

export const styles = StyleSheet.create({

  container: {

    flex: 1,
    padding: 20,
    backgroundColor: '#101820',

  },

  bannerOffline: {

    backgroundColor: '#ff3333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',

  },

  textoOffline: {

    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',

  },

  titulo: {

    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff99',
    marginBottom: 15,
    textAlign: 'center',

  },

  subtitulo: {

    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,

  },

  input: {

    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,

  },

  botao: {

    backgroundColor: '#00aa66',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,

  },

  botaoDesabilitado: {

    backgroundColor: '#777777',
    opacity: 0.7,

  },

  botaoTexto: {

    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',

  },

  linksContainer: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,

  },

  linkText: {

    color: '#00ff99',
    fontWeight: 'bold',

  },

});