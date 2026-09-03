import axios from 'axios';
// Criamos uma instância do Axios com o endereço base do nosso Backend
const api = axios.create({
    // IMPORTANTE: Troque o IP abaixo pelo IPv4 do seu computador!
    // Não use 'localhost', pois o celular não vai encontrar o servidor.
    baseURL: 'http://10.23.59.102:3001',
    // Garantimos que o servidor saiba que estamos enviando um JSON
    headers: {
        'Content-Type': 'application/json',
    }
});
export default api;
