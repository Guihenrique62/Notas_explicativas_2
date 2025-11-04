/*
  Warnings:

  - You are about to drop the column `contasAgrupadas` on the `TabelaDemonstrativa` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `TabelaDemonstrativa` table. All the data in the column will be lost.
  - You are about to drop the column `isGrupo` on the `TabelaDemonstrativa` table. All the data in the column will be lost.
  - Made the column `conta` on table `TabelaDemonstrativa` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."TabelaDemonstrativa" DROP COLUMN "contasAgrupadas",
DROP COLUMN "descricao",
DROP COLUMN "isGrupo",
ALTER COLUMN "conta" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."_TabelaDemonstrativaBalancete" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TabelaDemonstrativaBalancete_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TabelaDemonstrativaBalancete_B_index" ON "public"."_TabelaDemonstrativaBalancete"("B");

-- AddForeignKey
ALTER TABLE "public"."_TabelaDemonstrativaBalancete" ADD CONSTRAINT "_TabelaDemonstrativaBalancete_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."BalanceteData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TabelaDemonstrativaBalancete" ADD CONSTRAINT "_TabelaDemonstrativaBalancete_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TabelaDemonstrativa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
