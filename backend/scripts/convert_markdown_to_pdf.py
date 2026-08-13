"""
Converts DOCUMENTATION.md into a high-quality DOCUMENTATION.pdf
including vector architecture flowcharts, formatted tables, code blocks,
and dynamic page numbering.
"""
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas for dynamic running header and page X of Y footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Running Header (Pages 2+)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor('#4A0E17'))
            self.drawString(54, 11 * inch - 36, "ELAANJI — DOCUMENTATION")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor('#666666'))
            self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "SYSTEM SPECIFICATION & ARCHITECTURE")
            
            # Header divider
            self.setStrokeColor(colors.HexColor('#E5E0D8'))
            self.setLineWidth(0.75)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer (All Pages)
        self.setStrokeColor(colors.HexColor('#E5E0D8'))
        self.setLineWidth(0.75)
        self.line(54, 48, 8.5 * inch - 54, 48)

        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#888888'))
        self.drawString(54, 34, "ELAANJI Garments & Saree E-Commerce Platform — DOCUMENTATION.pdf")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 34, page_text)
        self.restoreState()


def create_architecture_diagram():
    """Generates an architectural flowchart vector diagram."""
    d = Drawing(504, 210)
    
    # Outer frame
    d.add(Rect(0, 0, 504, 210, fillColor=colors.HexColor('#FAF8F5'), strokeColor=colors.HexColor('#E5E0D8'), rx=8, ry=8))
    
    # Header title
    d.add(String(252, 192, "ELAANJI System Architecture & Integration Flow", textAnchor="middle", fontName="Helvetica-Bold", fontSize=11, fillColor=colors.HexColor('#4A0E17')))

    # 1. Frontend Box
    d.add(Rect(15, 105, 130, 65, fillColor=colors.HexColor('#1A1A1A'), strokeColor=None, rx=6, ry=6))
    d.add(String(80, 152, "Frontend SPA", textAnchor="middle", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white))
    d.add(String(80, 138, "React 18 + Vite + Tailwind", textAnchor="middle", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor('#D4AF37')))
    d.add(String(80, 124, "TanStack React Query", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#CCCCCC')))
    d.add(String(80, 112, "Hosted on Vercel", textAnchor="middle", fontName="Helvetica-Oblique", fontSize=7.5, fillColor=colors.HexColor('#888888')))

    # Arrow 1: Frontend -> Backend
    d.add(Line(145, 137, 185, 137, strokeColor=colors.HexColor('#4A0E17'), strokeWidth=2))
    d.add(Polygon([185, 141, 193, 137, 185, 133], fillColor=colors.HexColor('#4A0E17'), strokeColor=None))
    d.add(String(167, 143, "HTTPS/REST", textAnchor="middle", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.HexColor('#4A0E17')))

    # 2. Backend Box
    d.add(Rect(193, 105, 140, 65, fillColor=colors.HexColor('#4A0E17'), strokeColor=None, rx=6, ry=6))
    d.add(String(263, 152, "FastAPI Backend API", textAnchor="middle", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white))
    d.add(String(263, 138, "Python 3.12 + SQLAlchemy 2.0", textAnchor="middle", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor('#FAF8F5')))
    d.add(String(263, 124, "JWT Auth + RBAC Middleware", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#D4AF37')))
    d.add(String(263, 112, "Hosted on Render", textAnchor="middle", fontName="Helvetica-Oblique", fontSize=7.5, fillColor=colors.HexColor('#E5E0D8')))

    # Arrow 2: Backend -> DB
    d.add(Line(333, 137, 368, 137, strokeColor=colors.HexColor('#4A0E17'), strokeWidth=2))
    d.add(Polygon([368, 141, 376, 137, 368, 133], fillColor=colors.HexColor('#4A0E17'), strokeColor=None))
    d.add(String(351, 143, "SQL/ORM", textAnchor="middle", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.HexColor('#4A0E17')))

    # 3. Database Box
    d.add(Rect(376, 105, 113, 65, fillColor=colors.HexColor('#2C3E50'), strokeColor=None, rx=6, ry=6))
    d.add(String(432, 152, "PostgreSQL DB", textAnchor="middle", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white))
    d.add(String(432, 138, "Alembic Migrations", textAnchor="middle", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor('#BDC3C7')))
    d.add(String(432, 124, "Normalized Schema", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#ECF0F1')))
    d.add(String(432, 112, "Render Postgres", textAnchor="middle", fontName="Helvetica-Oblique", fontSize=7.5, fillColor=colors.HexColor('#95A5A6')))

    # Integrations (Bottom Row)
    # Google OAuth
    d.add(Line(80, 105, 80, 68, strokeColor=colors.HexColor('#7F8C8D'), strokeWidth=1.5, strokeDashArray=[3, 3]))
    d.add(Rect(25, 18, 110, 48, fillColor=colors.HexColor('#4285F4'), strokeColor=None, rx=4, ry=4))
    d.add(String(80, 48, "Google OAuth 2.0", textAnchor="middle", fontName="Helvetica-Bold", fontSize=8.5, fillColor=colors.white))
    d.add(String(80, 34, "ID Token Auth", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#E8F0FE')))
    d.add(String(80, 23, "@react-oauth/google", textAnchor="middle", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor('#D2E3FC')))

    # Cloudinary
    d.add(Line(225, 105, 225, 68, strokeColor=colors.HexColor('#7F8C8D'), strokeWidth=1.5, strokeDashArray=[3, 3]))
    d.add(Rect(170, 18, 110, 48, fillColor=colors.HexColor('#34495E'), strokeColor=None, rx=4, ry=4))
    d.add(String(225, 48, "Cloudinary CDN", textAnchor="middle", fontName="Helvetica-Bold", fontSize=8.5, fillColor=colors.white))
    d.add(String(225, 34, "Media Storage", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#BDC3C7')))
    d.add(String(225, 23, "Product Image Optimization", textAnchor="middle", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor('#ECF0F1')))

    # Razorpay Gateway
    d.add(Line(300, 105, 300, 68, strokeColor=colors.HexColor('#7F8C8D'), strokeWidth=1.5, strokeDashArray=[3, 3]))
    d.add(Rect(295, 18, 100, 48, fillColor=colors.HexColor('#0C2340'), strokeColor=None, rx=4, ry=4))
    d.add(String(345, 48, "Razorpay", textAnchor="middle", fontName="Helvetica-Bold", fontSize=8.5, fillColor=colors.HexColor('#00D294')))
    d.add(String(345, 34, "Payment Gateway", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.white))
    d.add(String(345, 23, "Order Checkout API", textAnchor="middle", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor('#BDC3C7')))

    # GitHub Actions CI
    d.add(Rect(410, 18, 80, 48, fillColor=colors.HexColor('#24292E'), strokeColor=None, rx=4, ry=4))
    d.add(String(450, 48, "GitHub Actions", textAnchor="middle", fontName="Helvetica-Bold", fontSize=8.5, fillColor=colors.white))
    d.add(String(450, 34, "CI Pipeline", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#2EA44F')))
    d.add(String(450, 23, "Automated Build Checks", textAnchor="middle", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor('#8B949E')))

    return d


def convert_md_to_pdf(md_filepath, output_pdf_filepath):
    md_path = Path(md_filepath).resolve()
    pdf_path = Path(output_pdf_filepath).resolve()

    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Luxury Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#4A0E17'),
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#555555'),
        spaceAfter=14,
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#4A0E17'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1A1A1A'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True,
    )

    h3_style = ParagraphStyle(
        'Header3',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#333333'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#222222'),
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=14,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        'CodeBlock',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1A1A1A'),
        backColor=colors.HexColor('#F4F1EA'),
        borderColor=colors.HexColor('#E0D9CC'),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=8,
        borderRadius=4,
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=body_style,
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#4A0E17'),
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=body_style,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#222222'),
        spaceAfter=0,
    )

    story = []

    lines = md_text.split('\n')
    in_code_block = False
    code_lines = []
    in_table = False
    table_lines = []

    def format_inline_markdown(text):
        """Replaces markdown inline styles like **bold**, `code`, etc. with ReportLab HTML tags."""
        text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
        text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
        text = re.sub(r'`(.*?)`', r'<font name="Courier" color="#4A0E17"><b>\1</b></font>', text)
        text = re.sub(r'\[(.*?)\]\((.*?)\)', r'<font color="#4A0E17"><u>\1</u></font>', text)
        return text

    def process_table(lines):
        rows = []
        for line in lines:
            if '|' not in line:
                continue
            # Ignore separator lines like | :--- | :--- |
            if re.match(r'^\s*\|?\s*:?-+:?\s*\|', line):
                continue
            cells = [c.strip() for c in line.split('|')[1:-1]]
            rows.append(cells)

        if not rows:
            return None

        formatted_table_data = []
        for row_idx, row in enumerate(rows):
            formatted_row = []
            for cell in row:
                st = table_header_style if row_idx == 0 else table_cell_style
                formatted_row.append(Paragraph(format_inline_markdown(cell), st))
            formatted_table_data.append(formatted_row)

        num_cols = max((len(r) for r in rows), default=0)
        if num_cols == 0:
            return None
        if num_cols == 3:
            col_widths = [1.5 * inch, 2.3 * inch, 3.2 * inch]
        elif num_cols == 2:
            col_widths = [2.5 * inch, 4.5 * inch]
        else:
            col_widths = [(7.0 / num_cols) * inch] * num_cols

        t = Table(formatted_table_data, colWidths=col_widths)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FAF8F5')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E0D8')),
        ]))
        return t

    i = 0
    while i < len(lines):
        line = lines[i]

        # Handle Code Block Start/End
        if line.strip().startswith('```'):
            if in_code_block:
                # End code block
                code_content = "\n".join(code_lines)
                # Escape XML special chars inside code block
                code_content = code_content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                story.append(Paragraph(code_content.replace('\n', '<br/>'), code_style))
                code_lines = []
                in_code_block = False
            else:
                # Start code block
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Handle Tables
        if '|' in line and not line.strip().startswith('```'):
            if not in_table:
                in_table = True
                table_lines = [line]
            else:
                table_lines.append(line)
            i += 1
            continue

        if in_table and '|' not in line:
            table_widget = process_table(table_lines)
            if table_widget:
                story.append(table_widget)
                story.append(Spacer(1, 8))
            in_table = False
            table_lines = []

        line_str = line.strip()

        if not line_str:
            i += 1
            continue

        if line_str == '---':
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E5E0D8'), spaceBefore=8, spaceAfter=10))
            i += 1
            continue

        if line_str.startswith('# '):
            story.append(Paragraph(format_inline_markdown(line_str[2:]), title_style))
        elif line_str.startswith('## '):
            text = format_inline_markdown(line_str[3:])
            story.append(Paragraph(text, h1_style))
            # Inject vector architecture diagram right after System Architecture section
            if 'System Architecture' in text or '3. System Architecture' in text:
                story.append(Spacer(1, 4))
                story.append(create_architecture_diagram())
                story.append(Spacer(1, 8))
        elif line_str.startswith('### '):
            story.append(Paragraph(format_inline_markdown(line_str[4:]), h2_style))
        elif line_str.startswith('#### '):
            story.append(Paragraph(format_inline_markdown(line_str[5:]), h3_style))
        elif line_str.startswith('- ') or line_str.startswith('* '):
            story.append(Paragraph(f"• {format_inline_markdown(line_str[2:])}", bullet_style))
        elif re.match(r'^\d+\.\s', line_str):
            num, rest = line_str.split('.', 1)
            story.append(Paragraph(f"<b>{num}.</b> {format_inline_markdown(rest.strip())}", bullet_style))
        else:
            story.append(Paragraph(format_inline_markdown(line_str), body_style))

        i += 1

    if in_table and table_lines:
        table_widget = process_table(table_lines)
        if table_widget:
            story.append(table_widget)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully converted DOCUMENTATION.md -> {pdf_path}")


if __name__ == "__main__":
    md_file = Path(__file__).resolve().parents[2] / "DOCUMENTATION.md"
    pdf_file = Path(__file__).resolve().parents[2] / "DOCUMENTATION.pdf"
    convert_md_to_pdf(md_file, pdf_file)
