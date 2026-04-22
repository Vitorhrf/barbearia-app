-- CreateEnum
CREATE TYPE "public"."DiaSemana" AS ENUM ('domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado');

-- CreateEnum
CREATE TYPE "public"."TipoBloqueioAgenda" AS ENUM ('barbeiro', 'geral');

-- CreateTable
CREATE TABLE "public"."HORARIOS_TRABALHO_BARBEIRO" (
    "id_horario_trabalho" SERIAL NOT NULL,
    "id_barbearia" INTEGER NOT NULL,
    "id_barbeiro" INTEGER NOT NULL,
    "dia_semana" "public"."DiaSemana" NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fim" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HORARIOS_TRABALHO_BARBEIRO_pkey" PRIMARY KEY ("id_horario_trabalho")
);

-- CreateTable
CREATE TABLE "public"."BLOQUEIOS_AGENDA" (
    "id_bloqueio_agenda" SERIAL NOT NULL,
    "id_barbearia" INTEGER NOT NULL,
    "id_barbeiro" INTEGER,
    "data_hora_inicio" TIMESTAMP(3) NOT NULL,
    "data_hora_fim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "tipo_bloqueio" "public"."TipoBloqueioAgenda" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BLOQUEIOS_AGENDA_pkey" PRIMARY KEY ("id_bloqueio_agenda")
);

-- AddForeignKey
ALTER TABLE "public"."HORARIOS_TRABALHO_BARBEIRO" ADD CONSTRAINT "HORARIOS_TRABALHO_BARBEIRO_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HORARIOS_TRABALHO_BARBEIRO" ADD CONSTRAINT "HORARIOS_TRABALHO_BARBEIRO_id_barbeiro_fkey" FOREIGN KEY ("id_barbeiro") REFERENCES "public"."BARBEIROS"("id_barbeiro") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BLOQUEIOS_AGENDA" ADD CONSTRAINT "BLOQUEIOS_AGENDA_id_barbearia_fkey" FOREIGN KEY ("id_barbearia") REFERENCES "public"."BARBEARIAS"("id_barbearia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BLOQUEIOS_AGENDA" ADD CONSTRAINT "BLOQUEIOS_AGENDA_id_barbeiro_fkey" FOREIGN KEY ("id_barbeiro") REFERENCES "public"."BARBEIROS"("id_barbeiro") ON DELETE RESTRICT ON UPDATE CASCADE;
