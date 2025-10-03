import PDFDocument from 'pdfkit';
import { Site } from '../../interfaces/site.interface';
import { EvaluationResult } from '../../interfaces/evaluation.interface';

export class PdfExporterService {
  /**
   * サイト評価結果をPDFとして生成
   */
  static async exportSitesToPdf(
    sites: Site[],
    evaluations: Map<string, EvaluationResult>
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // タイトルページ
        this.addTitlePage(doc);

        // サイト一覧
        sites.forEach((site, index) => {
          if (index > 0) {
            doc.addPage();
          }

          const evaluation = evaluations.get(site.siteId);
          this.addSitePage(doc, site, evaluation);
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * タイトルページを追加
   */
  private static addTitlePage(doc: PDFKit.PDFDocument): void {
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('BESS候補地評価レポート', { align: 'center' });

    doc.moveDown(2);

    doc
      .fontSize(12)
      .font('Helvetica')
      .text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, { align: 'center' });

    doc.moveDown(4);

    doc
      .fontSize(10)
      .text('本レポートは、BESS設置候補地の評価結果をまとめたものです。', {
        align: 'left',
      });
  }

  /**
   * サイト詳細ページを追加
   */
  private static addSitePage(
    doc: PDFKit.PDFDocument,
    site: Site,
    evaluation?: EvaluationResult
  ): void {
    // サイト名
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(site.siteName, { underline: true });

    doc.moveDown(1);

    // 基本情報
    doc.fontSize(12).font('Helvetica-Bold').text('基本情報');
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica');
    doc.text(`住所: ${site.address}`);
    doc.text(`緯度: ${site.latitude}`);
    doc.text(`経度: ${site.longitude}`);
    doc.text(`面積: ${site.areaSqm.toLocaleString()} ㎡`);
    doc.text(`土地利用: ${site.landUse || 'N/A'}`);
    doc.text(`ステータス: ${this.getStatusLabel(site.status)}`);

    doc.moveDown(1);

    // 評価結果
    if (evaluation) {
      doc.fontSize(12).font('Helvetica-Bold').text('評価結果');
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text(`総合スコア: ${evaluation.overallScore}/100`);
      doc.text(`評価: ${this.getScoreLabel(evaluation.overallScore)}`);

      doc.moveDown(0.5);

      // 各評価項目
      doc.fontSize(11).font('Helvetica-Bold').text('詳細評価:');
      doc.moveDown(0.3);

      doc.fontSize(10).font('Helvetica');

      if (evaluation.gridConnectionScore !== undefined) {
        doc.text(`  • 系統連系: ${evaluation.gridConnectionScore}/100`);
      }
      if (evaluation.roadAccessScore !== undefined) {
        doc.text(`  • 道路アクセス: ${evaluation.roadAccessScore}/100`);
      }
      if (evaluation.setbackScore !== undefined) {
        doc.text(`  • セットバック: ${evaluation.setbackScore}/100`);
      }
      if (evaluation.poleProximityScore !== undefined) {
        doc.text(`  • 電柱近接性: ${evaluation.poleProximityScore}/100`);
      }

      doc.moveDown(0.5);

      // 推奨事項
      if (evaluation.recommendations && evaluation.recommendations.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').text('推奨事項:');
        doc.moveDown(0.3);

        doc.fontSize(10).font('Helvetica');
        evaluation.recommendations.forEach((rec) => {
          doc.text(`  • ${rec}`, { indent: 10 });
        });
      }

      doc.moveDown(0.5);

      // 警告
      if (evaluation.warnings && evaluation.warnings.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').text('警告:');
        doc.moveDown(0.3);

        doc.fontSize(10).font('Helvetica');
        evaluation.warnings.forEach((warning) => {
          doc.text(`  ⚠ ${warning}`, { indent: 10 });
        });
      }
    } else {
      doc.fontSize(10).font('Helvetica').text('評価未実施');
    }

    // フッター
    doc.moveDown(2);
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('---', { align: 'center' });
  }

  /**
   * ステータスラベルを取得
   */
  private static getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: '未評価',
      evaluated: '評価済み',
      approved: '承認済み',
      rejected: '却下',
    };
    return labels[status] || status;
  }

  /**
   * スコアラベルを取得
   */
  private static getScoreLabel(score: number): string {
    if (score >= 80) return '優良';
    if (score >= 60) return '良好';
    if (score >= 40) return '可';
    return '不可';
  }
}
