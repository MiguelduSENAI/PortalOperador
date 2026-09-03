import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput, } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { ScrollView } from 'react-native';

export default function TelaStatus() {
  const [jogador, setJogador] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [salvandoAlteracoes, setSalvandoAlteracoes] =
    useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoJogo, setNovoJogo] = useState('');
  const [novaPlataforma, setNovaPlataforma] = useState('');

  useEffect(() => {

    carregarJogador();

  }, []);

  const carregarJogador = async () => {

    try {

      setCarregando(true);

      const id =
        await AsyncStorage.getItem('usuarioId');

      console.log(
        'ID salvo no celular:',
        id
      );

      if (!id) {

        Alert.alert(
          'Erro',
          'Nenhum usuário está logado.'
        );

        setJogador(null);

        return;
      }

      const resposta =
        await api.get(`/jogador/${id}`);

      console.log(
        'Dados recebidos da API:',
        resposta.data
      );

      setJogador(resposta.data);

    } catch (erro) {

      console.error(
        'Erro ao buscar jogador:',
        erro
      );

      if (erro.response) {

        console.log(
          'Erro da API:',
          erro.response.data
        );

        Alert.alert(
          'Erro',
          erro.response.data.mensagem ||
          erro.response.data.error ||
          'Erro ao buscar seus dados.'
        );

      } else {

        Alert.alert(
          'Erro',
          'Não foi possível conectar ao servidor.'
        );

      }

      setJogador(null);

    } finally {

      setCarregando(false);

    }

  };

  const iniciarEdicao = () => {

    if (!jogador) {
      return;
    }

    setNovoNome(jogador.nome || '');

    setNovoEmail(jogador.email || '');

    setNovoJogo(jogador.jogo || '');

    setNovaPlataforma(jogador.plataforma || '');

    setEditando(true);

  };

  const cancelarEdicao = () => {

    setNovoNome('');

    setNovoEmail('');

    setNovoJogo('');

    setNovaPlataforma('');

    setEditando(false);

  };

  const salvarAlteracoes = async () => {

    try {

      const id =
        await AsyncStorage.getItem('usuarioId');

      if (!id) {

        Alert.alert(
          'Erro',
          'Nenhum usuário está logado.'
        );

        return;
      }

      if (
        !novoNome.trim() ||
        !novoEmail.trim() ||
        !novoJogo.trim() ||
        !novaPlataforma.trim()
      ) {

        Alert.alert(
          'Atenção',
          'Preencha todos os campos.'
        );

        return;
      }

      setSalvandoAlteracoes(true);

      console.log(
        'Atualizando jogador:',
        id
      );

      const resposta = await api.put(
        `/jogador/${id}`,
        {
          nome: novoNome.trim(),
          email: novoEmail.trim(),
          jogo: novoJogo.trim(),
          plataforma: novaPlataforma.trim(),
        }
      );

      console.log(
        'Resposta da atualização:',
        resposta.data
      );

      Alert.alert(
        'Sucesso!',
        'Informações atualizadas com sucesso.'
      );

      setEditando(false);

      await carregarJogador();

    } catch (erro) {

      console.error(
        'Erro ao atualizar informações:',
        erro
      );

      if (erro.response) {

        console.log(
          'Resposta do servidor:',
          erro.response.data
        );

        Alert.alert(
          'Erro',
          erro.response.data.mensagem ||
          erro.response.data.error ||
          'Não foi possível atualizar as informações.'
        );

      } else {

        Alert.alert(
          'Erro',
          'Não foi possível conectar ao servidor.'
        );

      }

    } finally {

      setSalvandoAlteracoes(false);

    }

  };

  const escolherFotoGaleria = async () => {

    try {

      const permissao =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {

        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à galeria para escolher uma foto.'
        );

        return;
      }

      const resultado =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes: ['images'],

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.5,

          base64: true,

        });

      if (resultado.canceled) {
        return;
      }

      const foto =
        resultado.assets[0];

      console.log(
        'Foto escolhida da galeria.'
      );

      if (!foto.base64) {

        Alert.alert(
          'Erro',
          'Não foi possível converter a foto.'
        );

        return;
      }

      await enviarFoto(foto);

    } catch (erro) {

      console.error(
        'Erro ao escolher foto:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível escolher a foto.'
      );

    }

  };

  const tirarFoto = async () => {

    try {

      const permissao =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissao.granted) {

        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à câmera para tirar uma foto.'
        );

        return;
      }

      const resultado =
        await ImagePicker.launchCameraAsync({

          mediaTypes: ['images'],

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.5,

          base64: true,

        });

      if (resultado.canceled) {
        return;
      }

      const foto =
        resultado.assets[0];

      console.log(
        'Foto tirada pela câmera.'
      );

      if (!foto.base64) {

        Alert.alert(
          'Erro',
          'Não foi possível converter a foto.'
        );

        return;
      }

      await enviarFoto(foto);

    } catch (erro) {

      console.error(
        'Erro ao tirar foto:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível tirar a foto.'
      );

    }

  };

  const escolherOrigemFoto = () => {

    Alert.alert(
      'Foto do perfil',
      'De onde você deseja escolher sua foto?',

      [

        {
          text: 'Tirar Foto',
          onPress: tirarFoto,
        },

        {
          text: 'Escolher da Galeria',
          onPress: escolherFotoGaleria,
        },

        {
          text: 'Cancelar',
          style: 'cancel',
        },

      ]

    );

  };

  const enviarFoto = async (imagem) => {

    try {

      setCarregandoFoto(true);

      const id =
        await AsyncStorage.getItem('usuarioId');

      if (!id) {

        Alert.alert(
          'Erro',
          'Nenhum usuário está logado.'
        );

        return;
      }

      console.log(
        'Enviando foto para o usuário:',
        id
      );

      await api.patch(
        `/jogador/${id}/foto`,
        {
          foto: imagem.base64,
        }
      );

      Alert.alert(
        'Sucesso!',
        'Sua foto foi atualizada.'
      );

      await carregarJogador();

    } catch (erro) {

      console.error(
        'Erro ao enviar foto:',
        erro
      );

      if (erro.response) {

        console.log(
          'Resposta do servidor:',
          erro.response.data
        );

        Alert.alert(
          'Erro',
          erro.response.data.mensagem ||
          erro.response.data.error ||
          'Não foi possível enviar a foto.'
        );

      } else {

        Alert.alert(
          'Erro',
          'Não foi possível enviar a foto para o servidor.'
        );

      }

    } finally {

      setCarregandoFoto(false);

    }

  };

  if (carregando) {

    return (

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#00ff99"
        />

        <Text style={styles.loadingTexto}>
          Carregando seu perfil gamer...
        </Text>

      </View>

    );

  }

  if (!jogador) {






    return (

      <View style={styles.loadingContainer}>

        <Text style={styles.erroTexto}>
          Não foi possível carregar os dados
          do jogador.
        </Text>

        <TouchableOpacity
          style={styles.botaoTentar}
          onPress={carregarJogador}
        >

          <Text style={styles.botaoTentarTexto}>
            TENTAR NOVAMENTE
          </Text>

        </TouchableOpacity>

      </View>

    );

  }

  const imagemPerfil = jogador.foto
    ? {
      uri:
        `data:image/jpeg;base64,${jogador.foto}`,
    }
    : {
      uri:
        'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudoScroll}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.titulo}>
        Meu Perfil Gamer
      </Text>

      <View style={styles.fotoContainer}>
        <Image
          source={imagemPerfil}
          style={styles.foto}
        />

        <TouchableOpacity
          style={styles.botaoFoto}
          onPress={escolherOrigemFoto}
          disabled={carregandoFoto}
        >
          {carregandoFoto ? (
            <View style={styles.carregandoFotoContainer}>
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />

              <Text style={styles.botaoFotoTexto}>
                Enviando...
              </Text>
            </View>
          ) : (
            <Text style={styles.botaoFotoTexto}>
              TROCAR FOTO
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.dadosContainer}>
        {!editando ? (
          <>
            <Text style={styles.label}>
              Nome
            </Text>

            <Text style={styles.valor}>
              {jogador.nome || 'Não informado'}
            </Text>

            <Text style={styles.label}>
              E-mail
            </Text>

            <Text style={styles.valor}>
              {jogador.email || 'Não informado'}
            </Text>

            <Text style={styles.label}>
              Jogo favorito
            </Text>

            <Text style={styles.valor}>
              {jogador.jogo || 'Não informado'}
            </Text>

            <Text style={styles.label}>
              Plataforma
            </Text>

            <Text style={styles.valor}>
              {jogador.plataforma || 'Não informado'}
            </Text>

            <Text style={styles.label}>
              Status
            </Text>

            <View style={styles.statusContainer}>
              <View style={styles.statusBolinha} />

              <Text style={styles.statusTexto}>
                Jogador ativo
              </Text>
            </View>

            <TouchableOpacity
              style={styles.botaoEditar}
              onPress={iniciarEdicao}
            >
              <Text style={styles.botaoEditarTexto}>
                EDITAR INFORMAÇÕES
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.tituloEdicao}>
              Editar informações
            </Text>

            <Text style={styles.label}>
              Nome
            </Text>

            <TextInput
              style={styles.input}
              value={novoNome}
              onChangeText={setNovoNome}
              placeholder="Digite seu nome"
              placeholderTextColor="#71808a"
            />

            <Text style={styles.label}>
              E-mail
            </Text>

            <TextInput
              style={styles.input}
              value={novoEmail}
              onChangeText={setNovoEmail}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#71808a"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>
              Jogo favorito
            </Text>

            <TextInput
              style={styles.input}
              value={novoJogo}
              onChangeText={setNovoJogo}
              placeholder="Digite seu jogo favorito"
              placeholderTextColor="#71808a"
            />

            <Text style={styles.label}>
              Plataforma
            </Text>

            <TextInput
              style={styles.input}
              value={novaPlataforma}
              onChangeText={setNovaPlataforma}
              placeholder="Digite sua plataforma"
              placeholderTextColor="#71808a"
            />

            <TouchableOpacity
              style={styles.botaoSalvar}
              onPress={salvarAlteracoes}
              disabled={salvandoAlteracoes}
            >
              {salvandoAlteracoes ? (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
              ) : (
                <Text style={styles.botaoSalvarTexto}>
                  SALVAR ALTERAÇÕES
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={cancelarEdicao}
              disabled={salvandoAlteracoes}
            >
              <Text style={styles.botaoCancelarTexto}>
                CANCELAR
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#101820',
  },

  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00ff99',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 25,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#101820',
    padding: 20,
  },

  loadingTexto: {
    marginTop: 15,
    fontSize: 16,
    color: '#ffffff',
  },

  erroTexto: {
    fontSize: 16,
    color: '#ff5555',
    textAlign: 'center',
    marginBottom: 20,
  },

  fotoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },

  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#00ff99',
    backgroundColor: '#ffffff',
  },

  botaoFoto: {
    marginTop: 12,
    backgroundColor: '#00aa66',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  botaoFotoTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  carregandoFotoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dadosContainer: {
    width: '100%',
    backgroundColor: '#1b2730',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2d3d47',
  },

  label: {
    fontSize: 13,
    color: '#8c9aa3',
    marginTop: 10,
    marginBottom: 3,
  },

  valor: {
    fontSize: 18,
    color: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#34434d',
    paddingBottom: 8,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  statusBolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00ff99',
    marginRight: 8,
  },

  statusTexto: {
    color: '#00ff99',
    fontSize: 17,
    fontWeight: 'bold',
  },

  botaoEditar: {

    backgroundColor: '#0077aa',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 25,
    alignItems: 'center',
  },

  botaoEditarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  tituloEdicao: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff99',
    textAlign: 'center',
    marginBottom: 10,
  },

  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#34434d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: '#ffffff',
    backgroundColor: '#101820',
    marginBottom: 5,
  },

  botaoSalvar: {
    backgroundColor: '#00aa66',
    paddingVertical: 13,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },

  botaoSalvarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  botaoCancelar: {
    backgroundColor: '#444f56',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },

  botaoCancelarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  botaoTentar: {
    backgroundColor: '#00aa66',
    padding: 12,
    borderRadius: 8,
  },

  botaoTentarTexto: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

});