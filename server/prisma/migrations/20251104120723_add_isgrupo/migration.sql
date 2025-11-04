/*
  Warnings:

  - You are about to drop the column `description` on the `TabelaDemonstrativa` table. All the data in the column will be lost.
  - You are about to drop the `ContaAgrupada` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ContaAgrupada" DROP CONSTRAINT "ContaAgrupada_tabelaId_fkey";

-- AlterTable
ALTER TABLE "public"."TabelaDemonstrativa" DROP COLUMN "description",
ADD COLUMN     "contasAgrupadas" JSONB,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "isGrupo" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."ContaAgrupada";
