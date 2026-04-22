-- CreateEnum
CREATE TYPE "public"."PapelBarbearia" AS ENUM ('owner', 'admin', 'gerente', 'barbeiro', 'recepcao', 'financeiro', 'cliente');

-- AlterEnum
ALTER TYPE "public"."TipoUsuario" ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE "public"."TipoUsuario" ADD VALUE IF NOT EXISTS 'gerente';
ALTER TYPE "public"."TipoUsuario" ADD VALUE IF NOT EXISTS 'recepcao';
ALTER TYPE "public"."TipoUsuario" ADD VALUE IF NOT EXISTS 'financeiro';

-- CreateTable
CREATE TABLE "public"."BARBEARIAS" (
    "id_barbearia" SERIAL NOT NULL,
    "nome_fantasia" TEXT NOT NULL,
    "razao_social" TEXT,
    "cnpj" TEXT,
    "slug" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "logo_url" TEXT,
    "cor_primaria" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BARBEARIAS_pkey" PRIMARY KEY ("id_barbearia")
);

-- CreateTable
CREATE TABLE "public"."USUARIOS_BARBEARIAS" (
    "id_usuario_barbearia" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_barbearia" INTEGER NOT NULL,
    "papel" "public"."PapelBarbearia" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_entrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USUARIOS_BARBEARIAS_pkey" PRIMARY KEY ("id_usuario_barbearia")
);

-- CreateIndex
CREATE UNIQUE INDEX "BARBEARIAS_cnpj_key" ON "public"."BARBEARIAS"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "BARBEARIAS_slug_key" ON "public"."BARBEARIAS"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "USUARIO_BARBEARIA_usuario_barbearia_key" ON "public"."USUARIOS_BARBEARIAS"("id_usuario", "id_barbearia");

-- AlterTable
ALTER TABLE "public"."USUARIOS"
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."CLIENTES"
ADD COLUMN "id_barbearia" INTEGER,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."BARBEIROS"
ADD COLUMN "id_barbearia" INTEGER,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."SERVICOS"
ADD COLUMN "id_barbearia" INTEGER,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."AGENDAMENTOS"
ADD COLUMN "id_barbearia" INTEGER,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."PRODUTOS"
ADD COLUMN "id_barbearia" INTEGER,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."VENDAS"
ADD COLUMN "id_barbearia" INTEGER,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Seed existing rows into a default tenant before making the new FKs mandatory.
INSERT INTO "public"."BARBEARIAS" (
    "nome_fantasia",
    "razao_social",
    "cnpj",
    "slug",
    "telefone",
    "email",
    "endereco",
    "logo_url",
    "cor_primaria",
    "ativo",
    "created_at",
    "updated_at"
)
VALUES (
    'Barbearia Migrada',
    'Barbearia Migrada LTDA',
    NULL,
    'barbearia-migrada',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

UPDATE "public"."CLIENTES"
SET "id_barbearia" = (SELECT "id_barbearia" FROM "public"."BARBEARIAS" WHERE "slug" = 'barbearia-migrada');

UPDATE "public"."BARBEIROS"
SET "id_barbearia" = (SELECT "id_barbearia" FROM "public"."BARBEARIAS" WHERE "slug" = 'barbearia-migrada');

UPDATE "public"."SERVICOS"
SET "id_barbearia" = (SELECT "id_barbearia" FROM "public"."BARBEARIAS" WHERE "slug" = 'barbearia-migrada');

UPDATE "public"."AGENDAMENTOS"
SET "id_barbearia" = (SELECT "id_barbearia" FROM "public"."BARBEARIAS" WHERE "slug" = 'barbearia-migrada');

UPDATE "public"."PRODUTOS"
SET "id_barbearia" = (SELECT "id_barbearia" FROM "public"."BARBEARIAS" WHERE "slug" = 'barbearia-migrada');

UPDATE "public"."VENDAS"
SET "id_barbearia" = (SELECT "id_barbearia" FROM "public"."BARBEARIAS" WHERE "slug" = 'barbearia-migrada');

INSERT INTO "public"."USUARIOS_BARBEARIAS" (
    "id_usuario",
    "id_barbearia",
    "papel",
    "ativo",
    "data_entrada",
    "created_at",
    "updated_at"
)
SELECT
    "id_usuario",
    (SELECT "id_barbearia" FROM "public"."BARBEARIAS" WHERE "slug" = 'barbearia-migrada'),
    CASE "tipo_usuario"::text
        WHEN 'admin' THEN 'admin'::"public"."PapelBarbearia"
        WHEN 'barbeiro' THEN 'barbeiro'::"public"."PapelBarbearia"
        ELSE 'cliente'::"public"."PapelBarbearia"
    END,
    "ativo",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "public"."USUARIOS";

-- DropIndex
DROP INDEX "public"."CLIENTES_id_usuario_key";

-- DropIndex
DROP INDEX "public"."BARBEIROS_id_usuario_key";

-- AlterTable
ALTER TABLE "public"."CLIENTES"
ALTER COLUMN "id_barbearia" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."BARBEIROS"
ALTER COLUMN "id_barbearia" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."SERVICOS"
ALTER COLUMN "id_barbearia" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."AGENDAMENTOS"
ALTER COLUMN "id_barbearia" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."PRODUTOS"
ALTER COLUMN "id_barbearia" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."VENDAS"
ALTER COLUMN "id_barbearia" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CLIENTES_usuario_barbearia_key" ON "public"."CLIENTES"("id_usuario", "id_barbearia");

-- CreateIndex
CREATE UNIQUE INDEX "BARBEIROS_usuario_barbearia_key" ON "public"."BARBEIROS"("id_usuario", "id_barbearia");

-- AddForeignKey
ALTER TABLE "public"."USUARIOS_BARBEARIAS" ADD CONSTRAINT "USUARIOS_BARBEARIAS_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."USUARIOS"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."USUARIOS_BARBEARIAS" ADD CONSTRAINT "USUARIOS_BARBEARIAS_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CLIENTES" ADD CONSTRAINT "CLIENTES_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BARBEIROS" ADD CONSTRAINT "BARBEIROS_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SERVICOS" ADD CONSTRAINT "SERVICOS_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AGENDAMENTOS" ADD CONSTRAINT "AGENDAMENTOS_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PRODUTOS" ADD CONSTRAINT "PRODUTOS_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VENDAS" ADD CONSTRAINT "VENDAS_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;
