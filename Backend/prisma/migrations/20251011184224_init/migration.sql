-- CreateEnum
CREATE TYPE "public"."TipoUsuario" AS ENUM ('admin', 'barbeiro', 'cliente');

-- CreateEnum
CREATE TYPE "public"."StatusAgendamento" AS ENUM ('pendente', 'confirmado', 'cancelado', 'concluido');

-- CreateEnum
CREATE TYPE "public"."MetodoPagamento" AS ENUM ('dinheiro', 'pix', 'cartao');

-- CreateTable
CREATE TABLE "public"."USUARIOS" (
    "id_usuario" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "tipo_usuario" "public"."TipoUsuario" NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "USUARIOS_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "public"."CLIENTES" (
    "id_cliente" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "telefone" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "observacoes" TEXT,

    CONSTRAINT "CLIENTES_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "public"."BARBEIROS" (
    "id_barbeiro" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "especialidade" TEXT,
    "comissao" DECIMAL(65,30),
    "telefone" TEXT,

    CONSTRAINT "BARBEIROS_pkey" PRIMARY KEY ("id_barbeiro")
);

-- CreateTable
CREATE TABLE "public"."SERVICOS" (
    "id_servico" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(65,30) NOT NULL,
    "duracao_min" INTEGER NOT NULL,

    CONSTRAINT "SERVICOS_pkey" PRIMARY KEY ("id_servico")
);

-- CreateTable
CREATE TABLE "public"."AGENDAMENTOS" (
    "id_agendamento" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_barbeiro" INTEGER NOT NULL,
    "id_servico" INTEGER NOT NULL,
    "data_hora_inicio" TIMESTAMP(3) NOT NULL,
    "data_hora_fim" TIMESTAMP(3) NOT NULL,
    "status" "public"."StatusAgendamento" NOT NULL DEFAULT 'pendente',

    CONSTRAINT "AGENDAMENTOS_pkey" PRIMARY KEY ("id_agendamento")
);

-- CreateTable
CREATE TABLE "public"."PRODUTOS" (
    "id_produto" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT,
    "preco" DECIMAL(65,30) NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PRODUTOS_pkey" PRIMARY KEY ("id_produto")
);

-- CreateTable
CREATE TABLE "public"."VENDAS" (
    "id_venda" SERIAL NOT NULL,
    "id_cliente" INTEGER,
    "data_venda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor_total" DECIMAL(65,30) NOT NULL,
    "forma_pagamento" "public"."MetodoPagamento" NOT NULL,

    CONSTRAINT "VENDAS_pkey" PRIMARY KEY ("id_venda")
);

-- CreateTable
CREATE TABLE "public"."ITENS_VENDA" (
    "id_venda" INTEGER NOT NULL,
    "id_produto" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_unit" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ITENS_VENDA_pkey" PRIMARY KEY ("id_venda","id_produto")
);

-- CreateIndex
CREATE UNIQUE INDEX "USUARIOS_email_key" ON "public"."USUARIOS"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CLIENTES_id_usuario_key" ON "public"."CLIENTES"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "BARBEIROS_id_usuario_key" ON "public"."BARBEIROS"("id_usuario");

-- AddForeignKey
ALTER TABLE "public"."CLIENTES" ADD CONSTRAINT "CLIENTES_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIOS"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BARBEIROS" ADD CONSTRAINT "BARBEIROS_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIOS"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AGENDAMENTOS" ADD CONSTRAINT "AGENDAMENTOS_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."CLIENTES"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AGENDAMENTOS" ADD CONSTRAINT "AGENDAMENTOS_id_barbeiro_fkey" FOREIGN KEY ("id_barbeiro") REFERENCES "public"."BARBEIROS"("id_barbeiro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AGENDAMENTOS" ADD CONSTRAINT "AGENDAMENTOS_id_servico_fkey" FOREIGN KEY ("id_servico") REFERENCES "public"."SERVICOS"("id_servico") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VENDAS" ADD CONSTRAINT "VENDAS_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."CLIENTES"("id_cliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ITENS_VENDA" ADD CONSTRAINT "ITENS_VENDA_id_venda_fkey" FOREIGN KEY ("id_venda") REFERENCES "public"."VENDAS"("id_venda") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ITENS_VENDA" ADD CONSTRAINT "ITENS_VENDA_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "public"."PRODUTOS"("id_produto") ON DELETE RESTRICT ON UPDATE CASCADE;
