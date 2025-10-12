const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashSenha(senha) {
  return await bcrypt.hash(senha, SALT_ROUNDS);
}

async function main() {
  // Usuários
  const admin = await prisma.usuario.create({
    data: {
      nome: "Admin Barbearia",
      email: "admin@barbearia.com",
      senhaHash: await hashSenha("admin123"),
      tipoUsuario: "admin"
    }
  });

  const clienteUsuario = await prisma.usuario.create({
    data: {
      nome: "João Silva",
      email: "joao@cliente.com",
      senhaHash: await hashSenha("cliente123"),
      tipoUsuario: "cliente"
    }
  });

  const barbeiroUsuario = await prisma.usuario.create({
    data: {
      nome: "Carlos Barbeiro",
      email: "carlos@barbearia.com",
      senhaHash: await hashSenha("barbeiro123"),
      tipoUsuario: "barbeiro"
    }
  });

  // Clientes e Barbeiros
  const cliente = await prisma.cliente.create({
    data: {
      idUsuario: clienteUsuario.idUsuario,
      telefone: "61999999999",
      dataNascimento: new Date("1995-05-20"),
      observacoes: "Prefere cortes clássicos"
    }
  });

  const barbeiro = await prisma.barbeiro.create({
    data: {
      idUsuario: barbeiroUsuario.idUsuario,
      especialidade: "Cortes modernos",
      comissao: 0.2,
      telefone: "61888888888"
    }
  });

  // Serviços
  const corte = await prisma.servico.create({
    data: {
      nome: "Corte de cabelo",
      descricao: "Corte masculino tradicional",
      preco: 30,
      duracaoMin: 30
    }
  });

  const barba = await prisma.servico.create({
    data: {
      nome: "Barba",
      descricao: "Aparar e modelar barba",
      preco: 20,
      duracaoMin: 20
    }
  });

  // Produtos
  const pomada = await prisma.produto.create({
    data: {
      nome: "Pomada Modeladora",
      categoria: "Cabelo",
      preco: 25,
      quantidade: 10
    }
  });

  const shampoo = await prisma.produto.create({
    data: {
      nome: "Shampoo",
      categoria: "Higiene",
      preco: 15,
      quantidade: 20
    }
  });

  // Agendamento
  await prisma.agendamento.create({
    data: {
      idCliente: cliente.idCliente,
      idBarbeiro: barbeiro.idBarbeiro,
      idServico: corte.idServico,
      dataHoraInicio: new Date("2025-10-15T10:00:00"),
      dataHoraFim: new Date("2025-10-15T10:30:00"),
      status: "pendente"
    }
  });

  // Venda
  await prisma.venda.create({
    data: {
      idCliente: cliente.idCliente,
      valorTotal: 40,
      formaPagamento: "pix",
      vendaProdutos: {
        create: [
          { idProduto: pomada.idProduto, quantidade: 1, precoUnit: pomada.preco },
          { idProduto: shampoo.idProduto, quantidade: 1, precoUnit: shampoo.preco }
        ]
      }
    }
  });

  console.log("Seed concluída com bcrypt!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
