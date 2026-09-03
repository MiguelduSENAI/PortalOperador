import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { styles } from './index';
import api from '../services/api';
import axios from 'axios';


export default function TelaCadastro() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [jogo, setJogo] = useState('');
    const [plataforma, setPlataforma] = useState('');

    const cadastrarJogador = async () => {
       
        if (!nome || !email || !senha || !jogo || !plataforma) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos!');
            return;
        }

        try {

            const resposta = await api.post('/cadastro', {
                nome: nome,
                email: email,
                senha: senha,
                jogo: jogo,
                plataforma: plataforma
            });


            Alert.alert('Sucesso! Jogador cadastrado.', resposta.data.mensagem);


            setNome('');
            setEmail('');
            setSenha('');
            setJogo('');
            setPlataforma('');

        } catch (erro) {
            console.error(erro);

            if (erro.response) {
                
                Alert.alert('Atenção', erro.response.data.mensagem);
            } else {
                // Erro de conexão
                Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
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

                <Text style={styles.titulo}>
                    Cadastro Gamer
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Nome do jogador"
                    value={nome}
                    onChangeText={setNome}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Jogo favorito (ex: Fortnite, GTA, Minecraft)"
                    value={jogo}
                    onChangeText={setJogo}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Plataforma (PC, Xbox, PlayStation)"
                    value={plataforma}
                    onChangeText={setPlataforma}
                />

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
                    style={styles.botao}
                    onPress={cadastrarJogador}
                >
                    <Text style={styles.botaoTexto}>
                        CRIAR CONTA
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />

            </ScrollView>
        </KeyboardAvoidingView>
    );
}