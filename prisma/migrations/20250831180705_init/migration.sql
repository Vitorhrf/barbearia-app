/*
  Warnings:

  - The `cpf` column on the `Barber` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `cpf` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Barber" DROP COLUMN "cpf",
ADD COLUMN     "cpf" INTEGER;

-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "cpf",
ADD COLUMN     "cpf" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Barber_cpf_key" ON "public"."Barber"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Client_cpf_key" ON "public"."Client"("cpf");
