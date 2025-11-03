-- CreateTable
CREATE TABLE "public"."NotaComments" (
    "id" TEXT NOT NULL,
    "notaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotaComments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotaComments_notaId_idx" ON "public"."NotaComments"("notaId");

-- CreateIndex
CREATE INDEX "NotaComments_userId_idx" ON "public"."NotaComments"("userId");

-- CreateIndex
CREATE INDEX "NotaComments_createdAt_idx" ON "public"."NotaComments"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."NotaComments" ADD CONSTRAINT "NotaComments_notaId_fkey" FOREIGN KEY ("notaId") REFERENCES "public"."NotasExplicativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotaComments" ADD CONSTRAINT "NotaComments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
