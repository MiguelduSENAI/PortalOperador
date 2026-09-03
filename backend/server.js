require('dotenv').config();

const db = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({
  limit: '20mb',
  extended: true
}));

app.get('/jogos', async (req, res) => {
  try {

    const [jogadores] = await db.query(
      'SELECT * FROM jogadores'
    );

    const jogadoresConvertidos = jogadores.map((jogador) => {

      if (jogador.foto) {
        jogador.foto = Buffer.from(jogador.foto).toString('base64');
      } else {
        jogador.foto = null;
      }

      return jogador;
    });

    res.status(200).json(jogadoresConvertidos);

  } catch (erro) {

    console.error('ERRO AO BUSCAR JOGADORES:', erro);

    res.status(500).json({
      mensagem: 'Erro ao buscar os jogadores.'
    });

  }
});

app.post('/cadastro', async (req, res) => {

  const {
    nome,
    email,
    senha,
    jogo,
    plataforma
  } = req.body;

  if (
    !nome ||
    !email ||
    !senha ||
    !jogo ||
    !plataforma
  ) {

    return res.status(400).json({
      mensagem: 'Preencha todos os campos!'
    });

  }

  try {

    const sql = `
      INSERT INTO jogadores
      (nome, email, senha, jogo, plataforma)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [resultado] = await db.query(sql, [
      nome,
      email,
      senha,
      jogo,
      plataforma
    ]);

    res.status(201).json({
      mensagem: 'Jogador cadastrado com sucesso!',
      id: resultado.insertId
    });

  } catch (erro) {

    console.error('ERRO AO CADASTRAR:', erro);

    res.status(500).json({
      mensagem: 'Erro ao cadastrar jogador.'
    });

  }
});


app.post('/login', async (req, res) => {

  const {
    email,
    senha
  } = req.body;

  if (!email || !senha) {

    return res.status(400).json({
      mensagem: 'Informe e-mail e senha.'
    });

  }

  try {

    const [usuarios] = await db.query(
      `
      SELECT
        id,
        nome,
        email,
        jogo,
        plataforma
      FROM jogadores
      WHERE email = ?
      AND senha = ?
      `,
      [
        email,
        senha
      ]
    );

    if (usuarios.length === 0) {

      return res.status(401).json({
        mensagem: 'E-mail ou senha inválidos.'
      });

    }

    const usuario = usuarios[0];

    res.json({
      mensagem: 'Login realizado com sucesso!',
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      jogo: usuario.jogo,
      plataforma: usuario.plataforma
    });

  } catch (erro) {

    console.error('ERRO NO LOGIN:', erro);

    res.status(500).json({
      mensagem: 'Erro ao realizar login.'
    });

  }
});



app.get('/jogador/:id', async (req, res) => {

  const { id } = req.params;

  try {

    const [usuarios] = await db.query(
      `
      SELECT
        id,
        nome,
        email,
        jogo,
        plataforma,
        foto
      FROM jogadores
      WHERE id = ?
      `,
      [id]
    );

    if (usuarios.length === 0) {

      return res.status(404).json({
        mensagem: 'Jogador não encontrado.'
      });

    }

    const jogador = usuarios[0];

    if (jogador.foto) {

      jogador.foto = Buffer
        .from(jogador.foto)
        .toString('base64');

    } else {

      jogador.foto = null;

    }

    console.log(
      'JOGADOR BUSCADO:',
      jogador
    );

    res.status(200).json(jogador);

  } catch (erro) {

    console.error(
      'ERRO AO BUSCAR JOGADOR:',
      erro
    );

    res.status(500).json({
      mensagem: 'Erro ao buscar jogador.'
    });

  }
});


app.patch('/jogador/:id/foto', async (req, res) => {

  const { id } = req.params;
  const { foto } = req.body;

  try {


    if (!foto) {

      return res.status(400).json({
        mensagem: 'Nenhuma foto foi enviada.'
      });

    }

    const [usuarios] = await db.query(
      'SELECT id FROM jogadores WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {

      return res.status(404).json({
        mensagem: 'Jogador não encontrado.'
      });

    }


    let base64 = foto;


    if (base64.includes(',')) {

      base64 = base64.split(',')[1];

    }

    const imagemBuffer = Buffer.from(
      base64,
      'base64'
    );

    console.log(
      'Tamanho da imagem:',
      imagemBuffer.length,
      'bytes'
    );

    if (imagemBuffer.length === 0) {

      return res.status(400).json({
        mensagem: 'A imagem enviada está vazia ou inválida.'
      });

    }


    await db.query(
      `
      UPDATE jogadores
      SET foto = ?
      WHERE id = ?
      `,
      [
        imagemBuffer,
        id
      ]
    );

    console.log(
      'Foto salva no BLOB do jogador:',
      id
    );

    res.status(200).json({

      mensagem: 'Foto atualizada com sucesso!',

      foto: imagemBuffer.toString('base64')

    });

  } catch (erro) {

    console.error(
      'ERRO AO SALVAR FOTO:',
      erro
    );

    res.status(500).json({
      mensagem: 'Erro ao salvar a foto.'
    });

  }

});

app.put('/jogador/:id', async (req, res) => {
  const { id } = req.params;

  const {
    nome,
    email,
    jogo,
    plataforma
  } = req.body;

  try {

    const [usuarios] = await db.query(
      'SELECT id FROM jogadores WHERE id = ?',
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        mensagem: 'Jogador não encontrado.'
      });
    }

    if (!nome || !email || !jogo || !plataforma) {
      return res.status(400).json({
        mensagem: 'Preencha todos os campos.'
      });
    }

    await db.query(
      `
      UPDATE jogadores
      SET
        nome = ?,
        email = ?,
        jogo = ?,
        plataforma = ?
      WHERE id = ?
      `,
      [
        nome,
        email,
        jogo,
        plataforma,
        id
      ]
    );

    const [resultado] = await db.query(
      `
      SELECT
        id,
        nome,
        email,
        jogo,
        plataforma,
        foto
      FROM jogadores
      WHERE id = ?
      `,
      [id]
    );

    const jogador = resultado[0];

    if (jogador.foto) {
      jogador.foto =
        Buffer.from(jogador.foto).toString('base64');
    }

    console.log(
      'JOGADOR ATUALIZADO:',
      jogador
    );

    res.status(200).json({
      mensagem: 'Dados atualizados com sucesso!',
      jogador: jogador
    });

  } catch (erro) {

    console.error(
      'ERRO AO ATUALIZAR JOGADOR:',
      erro
    );

    res.status(500).json({
      mensagem: 'Erro ao atualizar os dados do jogador.'
    });
  }
});





app.delete('/jogador/:id', async (req, res) => {

  const { id } = req.params;

  try {

    await db.query(
      'DELETE FROM jogadores WHERE id = ?',
      [id]
    );

    console.log('Conta excluída. ID:', id);

    res.status(200).json({
      mensagem: 'Conta excluída com sucesso!'
    });

  } catch (erro) {

    console.error('Erro ao excluir conta:', erro);

    res.status(500).json({
      mensagem: 'Erro ao excluir conta.'
    });

  }

});





// POST /recuperar (Solicitar redefinição pelo App)
app.post('/recuperar', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Informe seu e-mail.'
    });
  }

  try {
    // Verifica se o jogador existe
    const [usuarios] = await db.query(
      'SELECT id, email FROM jogadores WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        error: 'E-mail não encontrado.'
      });
    }

    // Cria a solicitação para o RH
    await db.query(
      'INSERT INTO solicitacoes_senha (email) VALUES (?)',
      [email]
    );

    console.log(
      `[GAME] Solicitação de senha registrada para: ${email}`
    );

    res.status(200).json({
      message: 'Solicitação enviada ao RH com sucesso!'
    });

  } catch (erro) {
    console.error('ERRO AO RECUPERAR SENHA:', erro);

    res.status(500).json({
      error: 'Erro ao registrar solicitação.'
    });
  }
});


// GET /rh/solicitacoes (Listar chamados pendentes para o RH)
app.get('/rh/solicitacoes', async (req, res) => {
  try {
    const [solicitacoes] = await db.query(
      "SELECT * FROM solicitacoes_senha WHERE status = 'PENDENTE' ORDER BY data_solicitacao DESC"
    );
    res.status(200).json(solicitacoes);
  } catch (erro) {
    res.status(500).json({ error: 'Erro ao buscar solicitações.' });
  }
});



// PUT /rh/resetar-senha (RH redefine a senha para uma senha padrão)
app.put('/rh/resetar-senha', async (req, res) => {
  const { email, idSolicitacao } = req.body;

  const SENHA_PADRAO = 'gamer123';

  if (!email || !idSolicitacao) {
    return res.status(400).json({
      error: 'E-mail e solicitação são obrigatórios.'
    });
  }

  try {
    // Atualiza a senha do jogador
    const [resultado] = await db.query(
      'UPDATE jogadores SET senha = ? WHERE email = ?',
      [SENHA_PADRAO, email]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        error: 'Jogador não encontrado.'
      });
    }

    // Marca a solicitação como resolvida
    await db.query(
      "UPDATE solicitacoes_senha SET status = 'RESOLVIDO' WHERE id = ?",
      [idSolicitacao]
    );

    console.log(
      `[RH] Senha do jogador ${email} resetada.`
    );

    res.status(200).json({
      message: `Senha redefinida com sucesso para: ${SENHA_PADRAO}`
    });

  } catch (erro) {
    console.error('ERRO AO RESETAR SENHA:', erro);

    res.status(500).json({
      error: 'Erro ao redefinir senha.'
    });
  }
});




// =====================================================
// NOTIFICAÇÕES DIRECIONADAS
// =====================================================

// Enviar uma notificação para um jogador
app.post('/notificacoes/enviar', async (req, res) => {

  const {
    jogador_id,
    email,
    titulo,
    mensagem
  } = req.body;

  // Precisa informar pelo menos ID OU e-mail
  if ((!jogador_id && !email) || !titulo || !mensagem) {
    return res.status(400).json({
      mensagem: 'Informe jogador_id ou email, além de titulo e mensagem.'
    });
  }

  try {

    // Verifica se o jogador existe
    let jogadores;

    if (jogador_id) {

      [jogadores] = await db.query(
        'SELECT id, email FROM jogadores WHERE id = ?',
        [jogador_id]
      );

    } else {

      [jogadores] = await db.query(
        'SELECT id, email FROM jogadores WHERE email = ?',
        [email]
      );

    }

    if (jogadores.length === 0) {
      return res.status(404).json({
        mensagem: 'Jogador não encontrado.'
      });
    }

    const jogador = jogadores[0];

    // Salva a notificação
    await db.query(
      `INSERT INTO notificacoes
       (jogador_id, email, titulo, mensagem)
       VALUES (?, ?, ?, ?)`,
      [
        jogador.id,
        jogador.email,
        titulo,
        mensagem
      ]
    );

    console.log(
      `[NOTIFICAÇÃO] Aviso enviado para jogador ID ${jogador.id}`
    );

    res.status(201).json({
      mensagem: 'Notificação enviada com sucesso!'
    });

  } catch (erro) {

    console.error(
      'ERRO AO ENVIAR NOTIFICAÇÃO:',
      erro
    );

    res.status(500).json({
      mensagem: 'Erro ao enviar notificação.'
    });
  }
});


// =====================================================
// VERIFICAR NOTIFICAÇÃO DO JOGADOR
// =====================================================

app.get('/notificacoes/checar/:id', async (req, res) => {

  const { id } = req.params;

  try {

    const [notificacoes] = await db.query(
      `SELECT id, titulo, mensagem
       FROM notificacoes
       WHERE jogador_id = ?
       AND status = 'PENDENTE'
       ORDER BY id DESC
       LIMIT 1`,
      [id]
    );

    if (notificacoes.length === 0) {

      return res.status(200).json({
        temNotificacao: false
      });

    }

    const aviso = notificacoes[0];

    // Marca como lido
    await db.query(
      `UPDATE notificacoes
       SET status = 'LIDO'
       WHERE id = ?`,
      [aviso.id]
    );

    res.status(200).json({

      temNotificacao: true,

      titulo: aviso.titulo,

      mensagem: aviso.mensagem

    });

  } catch (erro) {

    console.error(
      'ERRO AO BUSCAR NOTIFICAÇÃO:',
      erro
    );

    res.status(500).json({
      mensagem: 'Erro ao buscar notificação.'
    });

  }

});






// =====================================================
// LOCALIZAÇÃO DO JOGADOR
// =====================================================

app.post('/localizacoes', async (req, res) => {

  const {
    jogador_id,
    latitude,
    longitude,
    tipo
  } = req.body;

 
  if (
    !jogador_id ||
    latitude === undefined ||
    longitude === undefined
  ) {
    return res.status(400).json({
      mensagem: 'jogador_id, latitude e longitude são obrigatórios.'
    });
  }


  const tipoRegistro =
    tipo === 'SAIDA'
      ? 'SAIDA'
      : tipo === 'ENTRADA'
        ? 'ENTRADA'
        : 'LOCALIZACAO';

  try {

   
    const [jogadores] = await db.query(
      'SELECT id FROM jogadores WHERE id = ?',
      [jogador_id]
    );

    if (jogadores.length === 0) {
      return res.status(404).json({
        mensagem: 'Jogador não encontrado.'
      });
    }

    
    const [resultado] = await db.query(
      `INSERT INTO localizacoes
       (jogador_id, latitude, longitude, tipo)
       VALUES (?, ?, ?, ?)`,
      [
        jogador_id,
        latitude,
        longitude,
        tipoRegistro
      ]
    );

    console.log(
      `[LOCALIZAÇÃO] Jogador ${jogador_id} registrado em ${latitude}, ${longitude} - ${tipoRegistro}`
    );

    res.status(201).json({
      mensagem: 'Localização registrada com sucesso!',
      id: resultado.insertId,
      jogador_id,
      latitude,
      longitude,
      tipo: tipoRegistro
    });

  } catch (erro) {

    console.error(
      'ERRO AO REGISTRAR LOCALIZAÇÃO:',
      erro
    );

    res.status(500).json({
      mensagem: 'Erro ao registrar localização.'
    });
  }

});








// Serve arquivos estáticos da pasta 'public' (onde ficará nosso HTML do RH)
app.use(express.static('public'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {

  console.log(
    `Servidor rodando na porta ${PORT}`
  );

});