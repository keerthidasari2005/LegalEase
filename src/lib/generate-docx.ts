import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";

export async function generateAndDownloadDocx(
  docType: string,
  content: string
) {
  const lines = content.split("\n").filter((l) => l.trim());
  const children: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      // Main title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace("# ", ""),
              bold: true,
              size: 32,
              font: "Times New Roman",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          heading: HeadingLevel.HEADING_1,
        })
      );
    } else if (trimmed.startsWith("## ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace("## ", ""),
              bold: true,
              size: 26,
              font: "Times New Roman",
            }),
          ],
          spacing: { before: 300, after: 150 },
          heading: HeadingLevel.HEADING_2,
        })
      );
    } else if (trimmed.startsWith("### ")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace("### ", ""),
              bold: true,
              size: 24,
              font: "Times New Roman",
            }),
          ],
          spacing: { before: 200, after: 100 },
          heading: HeadingLevel.HEADING_3,
        })
      );
    } else if (trimmed.startsWith("---")) {
      children.push(
        new Paragraph({
          border: {
            bottom: {
              color: "000000",
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { before: 200, after: 200 },
        })
      );
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.replace(/\*\*/g, ""),
              bold: true,
              size: 22,
              font: "Times New Roman",
            }),
          ],
          spacing: { before: 100, after: 100 },
        })
      );
    } else {
      // Process inline bold
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const runs = parts.map((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return new TextRun({
            text: part.replace(/\*\*/g, ""),
            bold: true,
            size: 22,
            font: "Times New Roman",
          });
        }
        return new TextRun({
          text: part,
          size: 22,
          font: "Times New Roman",
        });
      });

      children.push(
        new Paragraph({
          children: runs,
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const date = new Date().toISOString().split("T")[0];
  const filename = `LegalEase_${docType.replace(/\s+/g, "_")}_${date}.docx`;
  saveAs(blob, filename);
}
