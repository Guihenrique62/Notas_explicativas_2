-- AlterTable
ALTER TABLE "public"."TabelaDemonstrativa" ADD COLUMN     "description" TEXT,
ALTER COLUMN "conta" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."ContaAgrupada" (
    "id" TEXT NOT NULL,
    "tabelaId" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "contaNome" TEXT NOT NULL,
    "anoAnterior" DOUBLE PRECISION,
    "anoAtual" DOUBLE PRECISION,
    "ordem" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaAgrupada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContaAgrupada_tabelaId_idx" ON "public"."ContaAgrupada"("tabelaId");

-- CreateIndex
CREATE INDEX "ContaAgrupada_ordem_idx" ON "public"."ContaAgrupada"("ordem");

-- AddForeignKey
ALTER TABLE "public"."ContaAgrupada" ADD CONSTRAINT "ContaAgrupada_tabelaId_fkey" FOREIGN KEY ("tabelaId") REFERENCES "public"."TabelaDemonstrativa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
