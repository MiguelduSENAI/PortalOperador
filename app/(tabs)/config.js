import React, { useState } from 'react';

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert
} from 'react-native';

import { useRouter } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../services/api';


export default function TelaConfig() {

    const router = useRouter();

    const [modalVisivel, setModalVisivel] = useState(false);


    // ==========================================
    // FUNÇÃO PARA SAIR DO SISTEMA
    // ==========================================

    const fazerLogout = async () => {

        // Remove o ID do jogador salvo no celular
        await AsyncStorage.removeItem('usuarioId');

        // Fecha o modal
        setModalVisivel(false);

        // Volta para a tela de Login
        router.replace('/');
    };


    // ==========================================
    // FUNÇÃO PARA DELETAR A CONTA
    // ==========================================

    const deletarConta = async () => {

        try {

            // Pega o ID do jogador que está logado
            const idSalvo = await AsyncStorage.getItem('usuarioId');

            // Verifica se existe um usuário logado
            if (!idSalvo) {

                return Alert.alert(
                    'Erro',
                    'Nenhum usuário logado encontrado.'
                );

            }


            console.log(
                'Excluindo conta do jogador:',
                idSalvo
            );


            // Envia o DELETE para o backend
            await api.delete(`/jogador/${idSalvo}`);


            console.log(
                `Conta com ID ${idSalvo} excluída com sucesso.`
            );


            // Remove o ID salvo no celular
            await AsyncStorage.removeItem('usuarioId');


            // Mostra mensagem de sucesso
            Alert.alert(
                'Sucesso',
                'Sua conta foi excluída permanentemente.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/')
                    }
                ]
            );


        } catch (erro) {

            console.error(
                'ERRO AO EXCLUIR CONTA:',
                erro
            );


            // Se o servidor retornar algum erro
            if (erro.response) {

                console.error(
                    'Resposta do servidor:',
                    erro.response.data
                );

            }


            Alert.alert(
                'Erro',
                'Não foi possível excluir sua conta.'
            );

        }

    };


    // ==========================================
    // CONFIRMAÇÃO ANTES DE EXCLUIR
    // ==========================================

    const confirmarExclusao = () => {

        Alert.alert(
            'Excluir conta',

            'Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.',

            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },

                {
                    text: 'Sim, excluir',
                    style: 'destructive',
                    onPress: deletarConta
                }
            ]
        );

    };


    // ==========================================
    // TELA
    // ==========================================

    return (

        <View style={styles.container}>

            <Text style={styles.titulo}>
                Configurações da Conta
            </Text>


            {/* ================================
                BOTÃO SAIR
            ================================= */}

            <TouchableOpacity
                style={styles.botaoSair}
                onPress={() => setModalVisivel(true)}
            >

                <Text style={styles.textoBotaoSair}>
                    Sair do Sistema
                </Text>

            </TouchableOpacity>


            {/* ================================
                BOTÃO EXCLUIR CONTA
            ================================= */}

            <TouchableOpacity
                style={styles.botaoExcluir}
                onPress={confirmarExclusao}
            >

                <Text style={styles.textoBotaoExcluir}>
                    Excluir Minha Conta
                </Text>

            </TouchableOpacity>


            {/* ================================
                MODAL DE LOGOUT
            ================================= */}

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisivel}
                onRequestClose={() => setModalVisivel(false)}
            >

                <View style={styles.fundoModal}>

                    <View style={styles.caixaModal}>

                        <Text style={styles.textoModal}>
                            Deseja sair?
                        </Text>


                        <View style={styles.areaBotoes}>


                            {/* BOTÃO CANCELAR */}

                            <TouchableOpacity
                                style={styles.botaoCancelar}
                                onPress={() => setModalVisivel(false)}
                            >

                                <Text style={styles.textoCancelar}>
                                    Cancelar
                                </Text>

                            </TouchableOpacity>


                            {/* BOTÃO CONFIRMAR */}

                            <TouchableOpacity
                                style={styles.botaoConfirmar}
                                onPress={fazerLogout}
                            >

                                <Text style={styles.textoConfirmar}>
                                    Confirmar Sair
                                </Text>

                            </TouchableOpacity>


                        </View>

                    </View>

                </View>

            </Modal>

        </View>

    );

}


// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({

    container: {

        flex: 1,

        padding: 20,

        backgroundColor: '#f5f5f5',

        justifyContent: 'center'

    },


    titulo: {

        fontSize: 20,

        fontWeight: 'bold',

        marginBottom: 20,

        textAlign: 'center',

        color: '#003366'

    },


    // ======================================
    // BOTÃO SAIR
    // ======================================

    botaoSair: {

        backgroundColor: '#cc0000',

        padding: 15,

        borderRadius: 8,

        alignItems: 'center'

    },


    textoBotaoSair: {

        color: '#ffffff',

        fontSize: 16,

        fontWeight: 'bold'

    },


    // ======================================
    // BOTÃO EXCLUIR
    // ======================================

    botaoExcluir: {

        backgroundColor: 'transparent',

        borderWidth: 2,

        borderColor: '#cc0000',

        padding: 15,

        borderRadius: 8,

        alignItems: 'center',

        marginTop: 20

    },


    textoBotaoExcluir: {

        color: '#cc0000',

        fontSize: 16,

        fontWeight: 'bold'

    },


    // ======================================
    // FUNDO DO MODAL
    // ======================================

    fundoModal: {

        flex: 1,

        backgroundColor: 'rgba(0,0,0,0.5)',

        justifyContent: 'center',

        alignItems: 'center'

    },


    // ======================================
    // CAIXA DO MODAL
    // ======================================

    caixaModal: {

        width: '80%',

        backgroundColor: '#ffffff',

        padding: 25,

        borderRadius: 10,

        alignItems: 'center'

    },


    textoModal: {

        fontSize: 18,

        fontWeight: 'bold',

        textAlign: 'center',

        marginBottom: 25

    },


    // ======================================
    // ÁREA DOS BOTÕES DO MODAL
    // ======================================

    areaBotoes: {

        flexDirection: 'row',

        gap: 15

    },


    // ======================================
    // BOTÃO CANCELAR
    // ======================================

    botaoCancelar: {

        backgroundColor: '#cccccc',

        padding: 12,

        borderRadius: 8

    },


    textoCancelar: {

        color: '#000000',

        fontWeight: 'bold'

    },


    // ======================================
    // BOTÃO CONFIRMAR SAÍDA
    // ======================================

    botaoConfirmar: {

        backgroundColor: '#cc0000',

        padding: 12,

        borderRadius: 8

    },


    textoConfirmar: {

        color: '#ffffff',

        fontWeight: 'bold'

    }

});