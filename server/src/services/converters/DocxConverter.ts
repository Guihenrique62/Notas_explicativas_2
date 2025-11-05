// src/services/converters/DocxConverter.ts
import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableCell, 
  TableRow, 
  WidthType, 
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  Indent
} from 'docx';

export class DocxConverter {

  async convertNotasToDocx(notas: any[], showCents: boolean): Promise<Buffer> {
    try {
      const doc = this.createDocument(notas, showCents);
      const buffer = await this.saveDocument(doc);
      return buffer;
    } catch (error) {
      console.error('Erro ao converter notas para DOCX:', error);
      throw new Error(`Falha na conversão para Word: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private createDocument(notas: any[], showCents: boolean): Document {
    const children = [];

    // Título do documento - ABNT: Centralizado, negrito, tamanho maior
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "NOTAS EXPLICATIVAS",
            bold: true,
            size: 32,
            color: "000000", // Preto
            font: "Times New Roman"
          })
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Conteúdo das notas
    notas.forEach((nota, index) => {
      children.push(...this.createNotaSection(nota, index, notas.length, showCents));
    });

    return new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            }
          }
        },
        children: children
      }]
    });
  }

  private createNotaSection(nota: any, index: number, totalNotas: number, showCents: boolean): any[] {
    const section = [];

    // Título da nota - ABNT: Preto, negrito, Times New Roman
    section.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${nota.number} - ${nota.title}`,
            bold: true,
            size: 26,
            color: "000000", // Preto conforme solicitado
            font: "Times New Roman"
          })
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );

    // Tabela demonstrativa
    if (nota.tabelas && nota.tabelas.length > 0) {
      section.push(...this.createTabelaSection(nota.tabelas, showCents));
    }

    // Conteúdo da nota
    if (nota.content && this.hasMeaningfulContent(nota.content)) {
      const contentElements = this.parseHtmlContent(nota.content);
      section.push(...contentElements);
    } else {
      section.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Nenhum conteúdo adicionado a esta nota.",
              italics: true,
              color: "666666", // Cinza escuro
              font: "Times New Roman"
            })
          ],
          alignment: AlignmentType.CENTER,
          shading: {
            type: ShadingType.CLEAR,
            color: "f8f9fa",
            fill: "f8f9fa"
          },
          spacing: { before: 400, after: 200 }
        })
      );
    }

    

    // Separador entre notas
    if (index < totalNotas - 1) {
      section.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "―".repeat(50),
              color: "cccccc", // Cinza claro
              font: "Times New Roman"
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 }
        })
      );
    }

    return section;
  }

  private createTabelaSection(tabelas: any[], showCents: boolean): any[] {
    const section = [];
    
    // Espaço antes da tabela
    section.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: { before: 200, after: 200 }
      })
    );

    // Criar tabela
    const table = this.createTable(tabelas, showCents);
    section.push(table);

    return section;
  }

private createTable(tabelas: any[], showCents: boolean): Table {
    // Cabeçalho da tabela - ABNT: Fundo cinza, texto preto
    const headerRow = new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ 
                        text: "Conta", 
                        bold: true,
                        color: "000000", // Preto
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.CENTER
                })],
                shading: {
                    type: ShadingType.CLEAR,
                    color: "d9d9d9", // Cinza claro
                    fill: "d9d9d9"
                },
                margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                }
            }),
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ 
                        text: "Ano Anterior", 
                        bold: true,
                        color: "000000", // Preto
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.CENTER
                })],
                shading: {
                    type: ShadingType.CLEAR,
                    color: "d9d9d9",
                    fill: "d9d9d9"
                },
                margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                }
            }),
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ 
                        text: "Ano Atual", 
                        bold: true,
                        color: "000000", // Preto
                        font: "Times New Roman"
                    })],
                    alignment: AlignmentType.CENTER
                })],
                shading: {
                    type: ShadingType.CLEAR,
                    color: "d9d9d9",
                    fill: "d9d9d9"
                },
                margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                }
            })
        ],
        tableHeader: true
    });

    // Calcular totais
    let totalAnoAnterior = 0;
    let totalAnoAtual = 0;

    // Linhas da tabela
    const tableRows = tabelas.map((tabela, index) => {
        const isEven = index % 2 === 0;
        
        // Somar valores para o total (considerando apenas valores numéricos)
        if (typeof tabela.anoAnterior === 'number') {
            totalAnoAnterior += tabela.anoAnterior;
        }
        if (typeof tabela.anoAtual === 'number') {
            totalAnoAtual += tabela.anoAtual;
        }
        
        return new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ 
                            text: tabela.conta || '',
                            bold: true,
                            color: "000000", // Preto
                            font: "Times New Roman"
                        })]
                    })],
                    shading: isEven ? {
                        type: ShadingType.CLEAR,
                        color: "f2f2f2", // Cinzo muito claro para zebrado
                        fill: "f2f2f2"
                    } : undefined,
                    margins: {
                        top: 100,
                        bottom: 100,
                        left: 100,
                        right: 100
                    }
                }),
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ 
                            text: tabela.anoAnterior ? this.formatCurrency(tabela.anoAnterior, showCents) : '-',
                            font: "Times New Roman", // Fonte padrão ABNT
                            color: "000000" // Preto para valores normais
                        })],
                        alignment: AlignmentType.RIGHT
                    })],
                    shading: isEven ? {
                        type: ShadingType.CLEAR,
                        color: "f2f2f2",
                        fill: "f2f2f2"
                    } : undefined,
                    margins: {
                        top: 100,
                        bottom: 100,
                        left: 100,
                        right: 100
                    }
                }),
                new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ 
                            text: tabela.anoAtual ? this.formatCurrency(tabela.anoAtual, showCents) : '-',
                            font: "Times New Roman", // Fonte padrão ABNT
                            color: "000000" // Preto para valores normais
                        })],
                        alignment: AlignmentType.RIGHT
                    })],
                    shading: isEven ? {
                        type: ShadingType.CLEAR,
                        color: "f2f2f2",
                        fill: "f2f2f2"
                    } : undefined,
                    margins: {
                        top: 100,
                        bottom: 100,
                        left: 100,
                        right: 100
                    }
                })
            ]
        });
    });

    // Linha de Total
    const totalRow = new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ 
                        text: "Total",
                        bold: true,
                        color: "000000", // Preto
                        font: "Times New Roman"
                    })]
                })],
                shading: {
                    type: ShadingType.CLEAR,
                    color: "e6e6e6", // Cinza um pouco mais escuro para destacar o total
                    fill: "e6e6e6"
                },
                margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                }
            }),
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ 
                        text: this.formatCurrency(totalAnoAnterior, showCents),
                        bold: true,
                        font: "Times New Roman",
                        color: "000000" // Preto
                    })],
                    alignment: AlignmentType.RIGHT
                })],
                shading: {
                    type: ShadingType.CLEAR,
                    color: "e6e6e6",
                    fill: "e6e6e6"
                },
                margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                }
            }),
            new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ 
                        text: this.formatCurrency(totalAnoAtual, showCents),
                        bold: true,
                        font: "Times New Roman",
                        color: "000000" // Preto
                    })],
                    alignment: AlignmentType.RIGHT
                })],
                shading: {
                    type: ShadingType.CLEAR,
                    color: "e6e6e6",
                    fill: "e6e6e6"
                },
                margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                }
            })
        ]
    });

    return new Table({
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        columnWidths: [5000, 2500, 2500],
        borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "000000" }, // Preto
            bottom: { style: BorderStyle.NONE, size: 0, color: "000000" },
            left: { style: BorderStyle.NONE, size: 0, color: "000000" },
            right: { style: BorderStyle.NONE, size: 0, color: "000000" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "000000" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "000000" },
        },
        rows: [headerRow, ...tableRows, totalRow],
    });
}

  private parseHtmlContent(html: string): any[] {
    const elements: any[] = [];
    
    if (!html || html.trim() === '') {
      return elements;
    }

    try {
      // Processar HTML preservando estrutura de listas
      const processedHtml = this.preprocessHtml(html);
      const blocks = this.parseHtmlStructure(processedHtml);
      
      for (const block of blocks) {
        if (block.type === 'paragraph') {
          const element = this.convertHtmlToParagraph(block.content);
          if (element) elements.push(element);
        } else if (block.type === 'list') {
          const listElements = this.createListElements(block.items, block.listType);
          elements.push(...listElements);
        }
      }

    } catch (error) {
      console.error('Erro ao parsear HTML:', error);
      // Fallback: conteúdo simples
      const cleanText = this.stripHtml(html);
      if (cleanText.trim()) {
        elements.push(
          new Paragraph({
            children: [new TextRun({ 
              text: cleanText,
              font: "Times New Roman", // Fonte padrão ABNT
              color: "000000" // Preto
            })],
            spacing: { after: 200 }
          })
        );
      }
    }

    return elements;
  }

  private parseHtmlStructure(html: string): any[] {
    const blocks: any[] = [];
    let currentList: any[] = [];
    let currentListType: 'ul' | 'ol' | null = null;
    let i = 0;

    while (i < html.length) {
      if (html[i] === '<') {
        const tagEnd = html.indexOf('>', i);
        if (tagEnd === -1) break;

        const fullTag = html.substring(i, tagEnd + 1);
        const tagName = fullTag.replace(/[<\/>]/g, '').split(' ')[0].toLowerCase();

        if (tagName === 'ul' || tagName === 'ol') {
          if (fullTag.startsWith('</')) {
            // Fechar lista
            if (currentList.length > 0 && currentListType) {
              blocks.push({
                type: 'list',
                listType: currentListType,
                items: [...currentList]
              });
            }
            currentList = [];
            currentListType = null;
          } else {
            // Abrir lista
            currentListType = tagName as 'ul' | 'ol';
            currentList = [];
          }
          i = tagEnd + 1;
        } else if (tagName === 'li') {
          if (!fullTag.startsWith('</')) {
            // Encontrar o fechamento </li>
            const liEnd = html.indexOf('</li>', tagEnd);
            if (liEnd === -1) break;

            const liContent = html.substring(tagEnd + 1, liEnd);
            if (liContent.trim() && currentListType) {
              currentList.push(liContent.trim());
            }
            i = liEnd + 5; // Avançar após </li>
          } else {
            i = tagEnd + 1;
          }
        } else if (tagName === 'p') {
          if (!fullTag.startsWith('</')) {
            // Encontrar o fechamento </p>
            const pEnd = html.indexOf('</p>', tagEnd);
            if (pEnd === -1) break;

            const pContent = html.substring(tagEnd + 1, pEnd);
            if (pContent.trim()) {
              blocks.push({
                type: 'paragraph',
                content: pContent.trim()
              });
            }
            i = pEnd + 4; // Avançar após </p>
          } else {
            i = tagEnd + 1;
          }
        } else {
          // Outras tags - pular
          i = tagEnd + 1;
        }
      } else {
        // Texto fora de tags - procurar próxima tag
        const nextTag = html.indexOf('<', i);
        if (nextTag === -1) break;

        const textContent = html.substring(i, nextTag).trim();
        if (textContent) {
          blocks.push({
            type: 'paragraph',
            content: textContent
          });
        }
        i = nextTag;
      }
    }

    // Se ainda houver lista aberta
    if (currentList.length > 0 && currentListType) {
      blocks.push({
        type: 'list',
        listType: currentListType,
        items: [...currentList]
      });
    }

    return blocks;
  }

  private createListElements(listItems: string[], listType: 'ul' | 'ol'): any[] {
    const elements: any[] = [];

    listItems.forEach((item, index) => {
      if (item.trim()) {
        const bullet = listType === 'ul' ? '•' : `${index + 1}.`;
        const textRuns = this.parseInlineFormatting(item);
        
        // Adicionar o bullet/numero como primeiro TextRun
        const bulletRun = new TextRun({
          text: `${bullet} `,
          bold: true,
          font: "Times New Roman",
          color: "000000" // Preto
        });

        elements.push(
          new Paragraph({
            children: [bulletRun, ...textRuns],
            indent: {
              left: 720, // 0.5 inch
              hanging: 360 // 0.25 inch
            },
            spacing: { after: 100 }
          })
        );
      }
    });

    // Adicionar um parágrafo vazio após a lista para separação
    if (elements.length > 0) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: "" })],
          spacing: { after: 200 }
        })
      );
    }

    return elements;
  }

  private preprocessHtml(html: string): string {
    return html
      .replace(/<p><br\s*\/?><\/p>/gi, '') // Remover parágrafos vazios com br
      .replace(/<div>/gi, '<p>')
      .replace(/<\/div>/gi, '</p>')
      .replace(/<br\s*\/?>/gi, ' ') // Substituir br por espaço
      .replace(/&nbsp;/gi, ' ')
      .replace(/&#160;/gi, ' ')
      .replace(/<p>\s*<\/p>/gi, '') // Remover parágrafos vazios
      .replace(/\n/g, ' ') // Remover quebras de linha
      .replace(/\s+/g, ' ') // Normalizar espaços
      .trim();
  }

  private convertHtmlToParagraph(html: string): Paragraph | null {
    const textRuns = this.parseInlineFormatting(html);
    
    if (textRuns.length === 0) {
      return null;
    }

    return new Paragraph({
      children: textRuns,
      spacing: { before: 400, after: 200 }
    });
  }

  private parseInlineFormatting(html: string): TextRun[] {
    const textRuns: TextRun[] = [];
    let currentText = '';
    let currentBold = false;
    let currentItalic = false;
    let currentUnderline = false;

    let i = 0;
    while (i < html.length) {
      if (html[i] === '<' && i + 1 < html.length) {
        const tagEnd = html.indexOf('>', i);
        if (tagEnd === -1) {
          currentText += html[i];
          i++;
          continue;
        }

        const tag = html.substring(i, tagEnd + 1);
        
        // Adicionar texto acumulado antes da tag
        if (currentText) {
          textRuns.push(this.createTextRun(currentText, currentBold, currentItalic, currentUnderline));
          currentText = '';
        }

        // Processar a tag
        if (tag === '<strong>' || tag === '<b>') {
          currentBold = true;
        } else if (tag === '</strong>' || tag === '</b>') {
          currentBold = false;
        } else if (tag === '<em>' || tag === '<i>') {
          currentItalic = true;
        } else if (tag === '</em>' || tag === '</i>') {
          currentItalic = false;
        } else if (tag === '<u>') {
          currentUnderline = true;
        } else if (tag === '</u>') {
          currentUnderline = false;
        } else if (tag.startsWith('<span')) {
          // Ignorar spans por enquanto
        } else if (tag === '</span>') {
          // Ignorar
        } else {
          // Para outras tags desconhecidas, adicionar como texto
          currentText += this.stripHtml(tag);
        }

        i = tagEnd + 1;
      } else {
        currentText += html[i];
        i++;
      }
    }

    // Adicionar último texto
    if (currentText) {
      textRuns.push(this.createTextRun(currentText, currentBold, currentItalic, currentUnderline));
    }

    return textRuns;
  }

  private createTextRun(text: string, bold: boolean, italic: boolean, underline: boolean): TextRun {
    const options: any = { 
      text: text.trim(),
      font: "Times New Roman", // Fonte padrão ABNT
      color: "000000" // Preto
    };

    if (bold) options.bold = true;
    if (italic) options.italics = true;
    if (underline) options.underline = {};

    return new TextRun(options);
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private hasMeaningfulContent(content: string): boolean {
    if (!content) return false;
    
    const cleanContent = this.stripHtml(content);
    return cleanContent.length > 0;
  }

  private formatCurrency(value: number, showCents: boolean = true): string {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0
    };

    const formatted = new Intl.NumberFormat('pt-BR', options).format(Math.abs(value));
    
    return value < 0 ? `(${formatted})` : formatted;
  }

  private async saveDocument(doc: Document): Promise<Buffer> {
    const { Packer } = await import('docx');
    return Packer.toBuffer(doc);
  }
}