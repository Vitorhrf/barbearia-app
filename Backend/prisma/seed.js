const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashSenha(senha) {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

async function upsertUsuario({ nome, email, senha, tipoUsuario }) {
  return prisma.usuario.upsert({
    where: { email },
    update: {
      nome,
      senhaHash: await hashSenha(senha),
      tipoUsuario,
      ativo: true,
    },
    create: {
      nome,
      email,
      senhaHash: await hashSenha(senha),
      tipoUsuario,
    },
  });
}

async function main() {
  const barbearia = await prisma.barbearia.upsert({
    where: { slug: "barbearia-alpha" },
    update: {
      nomeFantasia: "Barbearia Alpha",
      razaoSocial: "Barbearia Alpha LTDA",
      cnpj: "12345678000199",
      telefone: "61999990000",
      email: "contato@barbeariaalpha.com",
      endereco: "Rua Exemplo, 100 - Centro",
      corPrimaria: "#1F2937",
      ativo: true,
    },
    create: {
      nomeFantasia: "Barbearia Alpha",
      razaoSocial: "Barbearia Alpha LTDA",
      cnpj: "12345678000199",
      slug: "barbearia-alpha",
      telefone: "61999990000",
      email: "contato@barbeariaalpha.com",
      endereco: "Rua Exemplo, 100 - Centro",
      corPrimaria: "#1F2937",
    },
  });

  const [ownerUsuario, clienteUsuario, barbeiroUsuario] = await Promise.all([
    upsertUsuario({
      nome: "Owner Barbearia",
      email: "owner@barbearia.com",
      senha: "owner123",
      tipoUsuario: "owner",
    }),
    upsertUsuario({
      nome: "Joao Silva",
      email: "joao@cliente.com",
      senha: "cliente123",
      tipoUsuario: "cliente",
    }),
    upsertUsuario({
      nome: "Carlos Barbeiro",
      email: "carlos@barbearia.com",
      senha: "barbeiro123",
      tipoUsuario: "barbeiro",
    }),
  ]);

  await prisma.usuarioBarbearia.upsert({
    where: {
      idUsuario_idBarbearia: {
        idUsuario: ownerUsuario.idUsuario,
        idBarbearia: barbearia.idBarbearia,
      },
    },
    update: {
      papel: "owner",
      ativo: true,
    },
    create: {
      idUsuario: ownerUsuario.idUsuario,
      idBarbearia: barbearia.idBarbearia,
      papel: "owner",
    },
  });

  await prisma.usuarioBarbearia.upsert({
    where: {
      idUsuario_idBarbearia: {
        idUsuario: clienteUsuario.idUsuario,
        idBarbearia: barbearia.idBarbearia,
      },
    },
    update: {
      papel: "cliente",
      ativo: true,
    },
    create: {
      idUsuario: clienteUsuario.idUsuario,
      idBarbearia: barbearia.idBarbearia,
      papel: "cliente",
    },
  });

  await prisma.usuarioBarbearia.upsert({
    where: {
      idUsuario_idBarbearia: {
        idUsuario: barbeiroUsuario.idUsuario,
        idBarbearia: barbearia.idBarbearia,
      },
    },
    update: {
      papel: "barbeiro",
      ativo: true,
    },
    create: {
      idUsuario: barbeiroUsuario.idUsuario,
      idBarbearia: barbearia.idBarbearia,
      papel: "barbeiro",
    },
  });

  const cliente = await prisma.cliente.upsert({
    where: {
      idUsuario_idBarbearia: {
        idUsuario: clienteUsuario.idUsuario,
        idBarbearia: barbearia.idBarbearia,
      },
    },
    update: {
      telefone: "61999999999",
      dataNascimento: new Date("1995-05-20"),
      observacoes: "Prefere cortes classicos",
    },
    create: {
      idUsuario: clienteUsuario.idUsuario,
      idBarbearia: barbearia.idBarbearia,
      telefone: "61999999999",
      dataNascimento: new Date("1995-05-20"),
      observacoes: "Prefere cortes classicos",
    },
  });

  const barbeiro = await prisma.barbeiro.upsert({
    where: {
      idUsuario_idBarbearia: {
        idUsuario: barbeiroUsuario.idUsuario,
        idBarbearia: barbearia.idBarbearia,
      },
    },
    update: {
      especialidade: "Cortes modernos",
      comissao: 0.2,
      telefone: "61888888888",
    },
    create: {
      idUsuario: barbeiroUsuario.idUsuario,
      idBarbearia: barbearia.idBarbearia,
      especialidade: "Cortes modernos",
      comissao: 0.2,
      telefone: "61888888888",
    },
  });

  const corte = await prisma.servico.upsert({
    where: {
      idServico: (
        await prisma.servico.findFirst({
          where: {
            idBarbearia: barbearia.idBarbearia,
            nome: "Corte de cabelo",
          },
          select: { idServico: true },
        })
      )?.idServico ?? -1,
    },
    update: {
      descricao: "Corte masculino tradicional",
      preco: 30,
      duracaoMin: 30,
    },
    create: {
      idBarbearia: barbearia.idBarbearia,
      nome: "Corte de cabelo",
      descricao: "Corte masculino tradicional",
      preco: 30,
      duracaoMin: 30,
    },
  });

  const barba = await prisma.servico.upsert({
    where: {
      idServico: (
        await prisma.servico.findFirst({
          where: {
            idBarbearia: barbearia.idBarbearia,
            nome: "Barba",
          },
          select: { idServico: true },
        })
      )?.idServico ?? -2,
    },
    update: {
      descricao: "Aparar e modelar barba",
      preco: 20,
      duracaoMin: 20,
    },
    create: {
      idBarbearia: barbearia.idBarbearia,
      nome: "Barba",
      descricao: "Aparar e modelar barba",
      preco: 20,
      duracaoMin: 20,
    },
  });

  const pomada = await prisma.produto.upsert({
    where: {
      idProduto: (
        await prisma.produto.findFirst({
          where: {
            idBarbearia: barbearia.idBarbearia,
            nome: "Pomada Modeladora",
          },
          select: { idProduto: true },
        })
      )?.idProduto ?? -1,
    },
    update: {
      categoria: "Cabelo",
      preco: 25,
      quantidade: 10,
    },
    create: {
      idBarbearia: barbearia.idBarbearia,
      nome: "Pomada Modeladora",
      categoria: "Cabelo",
      preco: 25,
      quantidade: 10,
    },
  });

  const shampoo = await prisma.produto.upsert({
    where: {
      idProduto: (
        await prisma.produto.findFirst({
          where: {
            idBarbearia: barbearia.idBarbearia,
            nome: "Shampoo",
          },
          select: { idProduto: true },
        })
      )?.idProduto ?? -2,
    },
    update: {
      categoria: "Higiene",
      preco: 15,
      quantidade: 20,
    },
    create: {
      idBarbearia: barbearia.idBarbearia,
      nome: "Shampoo",
      categoria: "Higiene",
      preco: 15,
      quantidade: 20,
    },
  });

  const agendamentoExistente = await prisma.agendamento.findFirst({
    where: {
      idBarbearia: barbearia.idBarbearia,
      idCliente: cliente.idCliente,
      idBarbeiro: barbeiro.idBarbeiro,
      idServico: corte.idServico,
      dataHoraInicio: new Date("2026-05-15T10:00:00"),
    },
    select: { idAgendamento: true },
  });

  if (!agendamentoExistente) {
    await prisma.agendamento.create({
      data: {
        idBarbearia: barbearia.idBarbearia,
        idCliente: cliente.idCliente,
        idBarbeiro: barbeiro.idBarbeiro,
        idServico: corte.idServico,
        dataHoraInicio: new Date("2026-05-15T10:00:00"),
        dataHoraFim: new Date("2026-05-15T10:30:00"),
        status: "pendente",
      },
    });
  }

  const vendaExistente = await prisma.venda.findFirst({
    where: {
      idBarbearia: barbearia.idBarbearia,
      idCliente: cliente.idCliente,
      valorTotal: 40,
      formaPagamento: "pix",
    },
    select: { idVenda: true },
  });

  if (!vendaExistente) {
    await prisma.venda.create({
      data: {
        idBarbearia: barbearia.idBarbearia,
        idCliente: cliente.idCliente,
        valorTotal: 40,
        formaPagamento: "pix",
        vendaProdutos: {
          create: [
            { idProduto: pomada.idProduto, quantidade: 1, precoUnit: pomada.preco },
            { idProduto: shampoo.idProduto, quantidade: 1, precoUnit: shampoo.preco },
          ],
        },
      },
    });
  }

  console.log("Seed multi-barbearias concluida.");
  console.log(`Barbearia pronta: ${barbearia.nomeFantasia} (${barbearia.slug})`);
  console.log(`Servicos base: ${corte.nome} e ${barba.nome}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
