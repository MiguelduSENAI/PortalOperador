import React, { useEffect, useState } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';

import * as Location from 'expo-location';

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../../services/api';


export default function Localizacao() {

    const [localizacao, setLocalizacao] = useState(null);

    const [carregando, setCarregando] = useState(true);

    const [registrando, setRegistrando] = useState(false);


    // =====================================================
    // PEGAR LOCALIZAÇÃO DO CELULAR
    // =====================================================

    useEffect(() => {

        pegarLocalizacao();

    }, []);


    const pegarLocalizacao = async () => {

        try {

            // Solicita permissão para usar o GPS
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {

                Alert.alert(
                    'Permissão necessária',
                    'Precisamos da permissão de localização para registrar sua posição.'
                );

                setCarregando(false);

                return;
            }


            // Pega a localização atual
            const posicao =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High
                });


            const latitude =
                posicao.coords.latitude;

            const longitude =
                posicao.coords.longitude;


            setLocalizacao({
                latitude,
                longitude
            });


        } catch (erro) {

            console.error(
                'ERRO AO PEGAR LOCALIZAÇÃO:',
                erro
            );

            Alert.alert(
                'Erro',
                'Não foi possível obter sua localização.'
            );

        } finally {

            setCarregando(false);

        }

    };


    // =====================================================
    // REGISTRAR ENTRADA / SAÍDA
    // =====================================================

    const registrarLocalizacao = async (tipo) => {

        try {

            setRegistrando(true);


            // Verifica se já temos a localização
            if (!localizacao) {

                Alert.alert(
                    'Aguarde',
                    'A localização ainda não foi obtida.'
                );

                return;
            }


            // Pega o ID do jogador logado
            const jogadorId =
                await AsyncStorage.getItem('usuarioId');


            if (!jogadorId) {

                Alert.alert(
                    'Erro',
                    'Jogador não identificado. Faça login novamente.'
                );

                return;
            }


            console.log(
                'Enviando localização:',
                {
                    jogador_id: jogadorId,
                    latitude: localizacao.latitude,
                    longitude: localizacao.longitude,
                    tipo
                }
            );


            // Envia para o backend
            const resposta = await api.post(
                '/localizacoes',
                {
                    jogador_id: Number(jogadorId),

                    latitude:
                        localizacao.latitude,

                    longitude:
                        localizacao.longitude,

                    tipo
                }
            );


            console.log(
                'RESPOSTA DO SERVIDOR:',
                resposta.data
            );


            Alert.alert(
                'Sucesso!',
                tipo === 'ENTRADA'
                    ? 'Entrada registrada com sucesso!'
                    : 'Saída registrada com sucesso!'
            );


        } catch (erro) {

            console.error(
                'ERRO AO REGISTRAR LOCALIZAÇÃO:',
                erro
            );


            if (erro.response) {

                console.error(
                    'Resposta do servidor:',
                    erro.response.data
                );

                Alert.alert(
                    'Erro',
                    erro.response.data?.mensagem ||
                    'Erro ao registrar localização.'
                );

            } else {

                Alert.alert(
                    'Erro',
                    'Não foi possível conectar ao servidor.'
                );

            }

        } finally {

            setRegistrando(false);

        }

    };


    // =====================================================
    // CARREGANDO
    // =====================================================

    if (carregando) {

        return (

            <View style={styles.carregando}>

                <ActivityIndicator size="large" />

                <Text style={styles.textoCarregando}>
                    Obtendo sua localização...
                </Text>

            </View>

        );

    }


    // =====================================================
    // TELA
    // =====================================================

    return (

        <View style={styles.container}>

            <Text style={styles.titulo}>
                Minha Localização
            </Text>


            {localizacao ? (

                <MapView
                    style={styles.mapa}

                    initialRegion={{
                        latitude: localizacao.latitude,

                        longitude: localizacao.longitude,

                        latitudeDelta: 0.005,

                        longitudeDelta: 0.005
                    }}
                >

                    <Marker
                        coordinate={{
                            latitude:
                                localizacao.latitude,

                            longitude:
                                localizacao.longitude
                        }}

                        title="Minha localização"

                        description="Você está aqui!"
                    />

                </MapView>

            ) : (

                <View style={styles.semLocalizacao}>

                    <Text>
                        Localização não disponível.
                    </Text>

                    <TouchableOpacity
                        style={styles.botaoAtualizar}
                        onPress={pegarLocalizacao}
                    >

                        <Text style={styles.textoBotao}>
                            Tentar novamente
                        </Text>

                    </TouchableOpacity>

                </View>

            )}


            {localizacao && (

                <View style={styles.info}>

                    <Text style={styles.coordenadas}>
                        Latitude: {localizacao.latitude.toFixed(6)}
                    </Text>

                    <Text style={styles.coordenadas}>
                        Longitude: {localizacao.longitude.toFixed(6)}
                    </Text>


                    <TouchableOpacity
                        style={styles.botaoEntrada}

                        disabled={registrando}

                        onPress={() =>
                            registrarLocalizacao('ENTRADA')
                        }
                    >

                        {registrando ? (

                            <ActivityIndicator color="#fff" />

                        ) : (

                            <Text style={styles.textoBotao}>
                                REGISTRAR ENTRADA
                            </Text>

                        )}

                    </TouchableOpacity>


                    <TouchableOpacity
                        style={styles.botaoSaida}

                        disabled={registrando}

                        onPress={() =>
                            registrarLocalizacao('SAIDA')
                        }
                    >

                        {registrando ? (

                            <ActivityIndicator color="#fff" />

                        ) : (

                            <Text style={styles.textoBotao}>
                                REGISTRAR SAÍDA
                            </Text>

                        )}

                    </TouchableOpacity>

                </View>

            )}

        </View>

    );

}


// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },

    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10
    },

    mapa: {
        flex: 1,
        width: '100%'
    },

    info: {
        backgroundColor: '#fff',
        padding: 20
    },

    coordenadas: {
        fontSize: 14,
        marginBottom: 5,
        color: '#555'
    },

    botaoEntrada: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
        alignItems: 'center'
    },

    botaoSaida: {
        backgroundColor: '#dc3545',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        alignItems: 'center'
    },

    textoBotao: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },

    carregando: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    textoCarregando: {
        marginTop: 10,
        fontSize: 16
    },

    semLocalizacao: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    botaoAtualizar: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
        marginTop: 15
    }

});