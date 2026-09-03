import { useEffect, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import * as Notifications from 'expo-notifications';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../services/api';


// Configuração da notificação quando o aplicativo estiver aberto
Notifications.setNotificationHandler({

    handleNotification: async () => ({

        shouldShowBanner: true,

        shouldShowList: true,

        shouldPlaySound: true,

        shouldSetBadge: false,

    }),

});


export default function TelaInicialRestrita() {

    const [comunicadoRecente, setComunicadoRecente] = useState(null);


    useEffect(() => {

        configurarEBuscarNotificacoes();

    }, []);


    const configurarEBuscarNotificacoes = async () => {

        try {

            // 1. Verifica se o celular já possui permissão
            const { status: statusExistente } =
                await Notifications.getPermissionsAsync();


            let statusFinal = statusExistente;


            // 2. Se ainda não tiver permissão, solicita
            if (statusExistente !== 'granted') {

                const { status } =
                    await Notifications.requestPermissionsAsync();

                statusFinal = status;

            }


            // 3. Se o usuário negar, para aqui
            if (statusFinal !== 'granted') {

                console.log(
                    'Permissão para notificações negada.'
                );

                return;

            }


            // 4. Pega o ID salvo durante o login
            const idDoUsuario =
                await AsyncStorage.getItem('usuarioId');


            console.log(
                'ID do jogador logado:',
                idDoUsuario
            );


            if (!idDoUsuario) {

                console.log(
                    'Nenhum ID de usuário encontrado.'
                );

                return;

            }


            // 5. Consulta o backend
            const resposta = await api.get(
                `/notificacoes/checar/${idDoUsuario}`
            );


            console.log(
                'Resposta das notificações:',
                resposta.data
            );


            // 6. Verifica se existe aviso`
            if (resposta.data.temNotificacao) {

                // 7. Dispara a notificação nativa
                await Notifications.scheduleNotificationAsync({

                    content: {

                        title: resposta.data.titulo,

                        body: resposta.data.mensagem,

                    },

                    trigger: null,

                });


                // 8. Mostra também dentro da Home
                setComunicadoRecente({

                    titulo: resposta.data.titulo,

                    mensagem: resposta.data.mensagem,

                });

            }


        } catch (erro) {

            console.error(
                'ERRO AO BUSCAR NOTIFICAÇÃO:',
                erro
            );

        }

    };


    return (

        <View style={styles.container}>

            <Text style={styles.boasVindas}>
                Portal Gamer
            </Text>


            <View style={styles.cardInfo}>

                <Text style={styles.tituloCard}>
                    🎮 Notícias e Avisos
                </Text>


                <Text style={styles.textoCard}>
                    - Novos campeonatos disponíveis.
                </Text>


                <Text style={styles.textoCard}>
                    - Confira as novidades dos seus jogos favoritos.
                </Text>

            </View>


            {/* Aviso enviado especificamente para este jogador */}

            {comunicadoRecente && (

                <View style={styles.cardNotificacao}>

                    <Text style={styles.tituloNotificacao}>
                        🔔 {comunicadoRecente.titulo}
                    </Text>


                    <Text style={styles.textoNotificacao}>
                        {comunicadoRecente.mensagem}
                    </Text>

                </View>

            )}


            {/* Botão para testar novamente */}

            <TouchableOpacity
                style={styles.botaoChecar}
                onPress={configurarEBuscarNotificacoes}
            >

                <Text style={styles.textoBotao}>
                    🔄 Verificar novos avisos
                </Text>

            </TouchableOpacity>


        </View>

    );

}


const styles = StyleSheet.create({

    container: {

        flex: 1,

        padding: 20,

        backgroundColor: '#101820',

    },


    boasVindas: {

        fontSize: 28,

        fontWeight: 'bold',

        color: '#00ff99',

        marginBottom: 20,

    },


    cardInfo: {

        backgroundColor: '#ffffff',

        padding: 20,

        borderRadius: 8,

        borderWidth: 1,

        borderColor: '#ddd',

    },


    tituloCard: {

        fontSize: 18,

        fontWeight: 'bold',

        color: '#00aa66',

        marginBottom: 10,

    },


    textoCard: {

        fontSize: 16,

        color: '#555',

        marginBottom: 5,

    },


    cardNotificacao: {

        backgroundColor: '#e6fff5',

        padding: 15,

        borderRadius: 8,

        borderLeftWidth: 5,

        borderLeftColor: '#00aa66',

        marginTop: 20,

    },


    tituloNotificacao: {

        fontSize: 17,

        fontWeight: 'bold',

        color: '#008855',

        marginBottom: 5,

    },


    textoNotificacao: {

        fontSize: 15,

        color: '#333',

    },


    botaoChecar: {

        backgroundColor: '#00aa66',

        padding: 14,

        borderRadius: 8,

        alignItems: 'center',

        marginTop: 20,

    },


    textoBotao: {

        color: '#ffffff',

        fontWeight: 'bold',

        fontSize: 15,

    },

});