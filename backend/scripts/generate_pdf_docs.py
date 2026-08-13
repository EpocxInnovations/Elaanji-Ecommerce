"""
Script to generate ELAANJI_Project_Documentation.pdf with custom styling,
architecture flowcharts, database ER diagrams, and complete project documentation.
"""
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
    PageBreak,
    HRFlowable,
    KeepTogether,
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Group, Polygon


def create_flowchart():
    """Generates an architectural flowchart vector graphic."""
    d = Drawing(520, 220)
    
    # Background card
    d.add(Rect(0, 0, 520, 220, fillColor=colors.HexColor('#FAF8F5'), strokeColor=colors.HexColor('#E5E0D8'), rx=8, ry=8))
    
    # Title
    d.add(String(260, 200, "ELAANJI System Architecture & Data Flow", textAnchor="middle", fontName="Helvetica-Bold", fontSize=12, fillColor=colors.HexColor('#4A0E17')))

    # Nodes
    # 1. Frontend (Vercel)
    d.add(Rect(20, 110, 130, 60, fillColor=colors.HexColor('#1A1A1A'), strokeColor=None, rx=6, ry=6))
    d.add(String(85, 148, "React 18 Frontend", textAnchor="middle", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white))
    d.add(String(85, 132, "Vite + Tailwind + React Query", textAnchor="middle", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor('#D4AF37')))
    d.add(String(85, 118, "Hosted on Vercel", textAnchor="middle", fontName="Helvetica-Oblique", fontSize=8, fillColor=colors.HexColor('#CCCCCC')))

    # Arrow 1: Frontend -> Backend
    d.add(Line(150, 140, 190, 140, strokeColor=colors.HexColor('#4A0E17'), strokeWidth=2))
    d.add(Polygon([190, 144, 198, 140, 190, 136], fillColor=colors.HexColor('#4A0E17'), strokeColor=None))
    d.add(String(170, 146, "HTTPS", textAnchor="middle", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.HexColor('#4A0E17')))
    d.add(String(170, 128, "REST / JSON", textAnchor="middle", fontName="Helvetica", fontSize=7, fillColor=colors.HexColor('#666666')))

    # 2. Backend API (Render)
    d.add(Rect(198, 110, 140, 60, fillColor=colors.HexColor('#4A0E17'), strokeColor=None, rx=6, ry=6))
    d.add(String(268, 148, "FastAPI Backend", textAnchor="middle", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white))
    d.add(String(268, 132, "Python 3.12 + SQLAlchemy", textAnchor="middle", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor('#FAF8F5')))
    d.add(String(268, 118, "Hosted on Render", textAnchor="middle", fontName="Helvetica-Oblique", fontSize=8, fillColor=colors.HexColor('#D4AF37')))

    # Arrow 2: Backend -> DB
    d.add(Line(338, 140, 378, 140, strokeColor=colors.HexColor('#4A0E17'), strokeWidth=2))
    d.add(Polygon([378, 144, 386, 140, 378, 136], fillColor=colors.HexColor('#4A0E17'), strokeColor=None))
    d.add(String(358, 146, "ORM", textAnchor="middle", fontName="Helvetica-Bold", fontSize=7, fillColor=colors.HexColor('#4A0E17')))

    # 3. Database (PostgreSQL)
    d.add(Rect(386, 110, 114, 60, fillColor=colors.HexColor('#2C3E50'), strokeColor=None, rx=6, ry=6))
    d.add(String(443, 148, "PostgreSQL DB", textAnchor="middle", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white))
    d.add(String(443, 132, "Alembic Migrations", textAnchor="middle", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor('#BDC3C7')))
    d.add(String(443, 118, "Render Postgres", textAnchor="middle", fontName="Helvetica-Oblique", fontSize=8, fillColor=colors.HexColor('#ECF0F1')))

    # External Integrations (Bottom Row)
    # Cloudinary
    d.add(Line(230, 110, 230, 70, strokeColor=colors.HexColor('#7F8C8D'), strokeWidth=1.5, strokeDashArray=[3, 3]))
    d.add(Rect(180, 20, 100, 45, fillColor=colors.HexColor('#34495E'), strokeColor=None, rx=4, ry=4))
    d.add(String(230, 48, "Cloudinary CDN", textAnchor="middle", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.white))
    d.add(String(230, 34, "Product Images", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#BDC3C7')))

    # Google OAuth
    d.add(Line(85, 110, 85, 70, strokeColor=colors.HexColor('#7F8C8D'), strokeWidth=1.5, strokeDashArray=[3, 3]))
    d.add(Rect(35, 20, 100, 45, fillColor=colors.HexColor('#4285F4'), strokeColor=None, rx=4, ry=4))
    d.add(String(85, 48, "Google OAuth 2.0", textAnchor="middle", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.white))
    d.add(String(85, 34, "Single Sign-In", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#E8F0FE')))

    # Razorpay Gateway
    d.add(Line(305, 110, 305, 70, strokeColor=colors.HexColor('#7F8C8D'), strokeWidth=1.5, strokeDashArray=[3, 3]))
    d.add(Rect(295, 20, 110, 45, fillColor=colors.HexColor('#0C2340'), strokeColor=None, rx=4, ry=4))
    d.add(String(350, 48, "Razorpay Gateway", textAnchor="middle", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.HexColor('#00D294')))
    d.add(String(350, 34, "Online Payments", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.white))

    # GitHub Actions CI
    d.add(Rect(415, 20, 85, 45, fillColor=colors.HexColor('#24292E'), strokeColor=None, rx=4, ry=4))
    d.add(String(457, 48, "GitHub Actions", textAnchor="middle", fontName="Helvetica-Bold", fontSize=8.5, fillColor=colors.white))
    d.add(String(457, 34, "CI Pipeline Checks", textAnchor="middle", fontName="Helvetica", fontSize=7.5, fillColor=colors.HexColor('#2EA44F')))

    return d


from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
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
            self.drawString(54, 11 * inch - 36, "ELAANJI — TECHNICAL PROJECT DOCUMENTATION")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor('#666666'))
            self.drawRightString(8.5 * inch - 54, 11 * inch - 36, "SYSTEM ARCHITECTURE & SPECIFICATION")
            
            # Header divider line
            self.setStrokeColor(colors.HexColor('#E5E0D8'))
            self.setLineWidth(0.75)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Running Footer (All Pages)
        self.setStrokeColor(colors.HexColor('#E5E0D8'))
        self.setLineWidth(0.75)
        self.line(54, 48, 8.5 * inch - 54, 48)

        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#888888'))
        self.drawString(54, 34, "Confidential — ELAANJI Garments & Saree E-Commerce Platform")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 34, page_text)
        self.restoreState()


def generate_pdf(filename="ELAANJI_Project_Documentation.pdf"):
    pdf_path = Path(filename).resolve()
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Luxury Palette Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#4A0E17'),
        spaceAfter=6,
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#555555'),
        spaceAfter=18,
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#4A0E17'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1A1A1A'),
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor('#222222'),
        spaceAfter=8,
    )

    bullet_style = ParagraphStyle(
        'BulletDark',
        parent=body_style,
        leftIndent=12,
        bulletIndent=4,
        spaceAfter=4,
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1A1A1A'),
        backColor=colors.HexColor('#F4F1EA'),
        borderColor=colors.HexColor('#E0D9CC'),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=8,
        borderRadius=4,
    )

    story = []

    # --- Header Banner ---
    story.append(Paragraph("ELAANJI — GARMENTS & SAREE E-COMMERCE PLATFORM", title_style))
    story.append(Paragraph("Comprehensive Technical Specification, System Architecture & Operational Guide", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#4A0E17'), spaceAfter=14))

    # --- Executive Summary ---
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "<b>ELAANJI</b> is a full-stack, enterprise-grade e-commerce web application specifically built for a luxury garments "
        "and traditional saree brand. The platform seamlessly combines an elegant, high-converting customer storefront "
        "with an administrative backoffice portal that manages catalog items, inventory transactions, customer orders, "
        "promotional banners, and real-time sales reporting.",
        body_style
    ))

    # Key Highlights Table
    summary_data = [
        [Paragraph("<b>Component</b>", body_style), Paragraph("<b>Technology / Implementation</b>", body_style), Paragraph("<b>Key Capability</b>", body_style)],
        [Paragraph("Backend API", body_style), Paragraph("FastAPI (Python 3.12) + Uvicorn", body_style), Paragraph("High-performance asynchronous RESTful APIs", body_style)],
        [Paragraph("Frontend SPA", body_style), Paragraph("React 18 + Vite + Tailwind CSS", body_style), Paragraph("Responsive mobile-first luxury interface", body_style)],
        [Paragraph("Database", body_style), Paragraph("PostgreSQL + SQLAlchemy 2.0 ORM", body_style), Paragraph("ACID transactions with Alembic migrations", body_style)],
        [Paragraph("Authentication", body_style), Paragraph("JWT Token Rotation + Google OAuth 2.0", body_style), Paragraph("Secure customer & admin access control", body_style)],
        [Paragraph("Asset CDN", body_style), Paragraph("Cloudinary Integration", body_style), Paragraph("Automated image optimization & storage", body_style)],
        [Paragraph("CI/CD Pipeline", body_style), Paragraph("GitHub Actions Workflow", body_style), Paragraph("Automated build & syntax validation", body_style)],
    ]

    t_summary = Table(summary_data, colWidths=[1.3*inch, 2.7*inch, 2.8*inch])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FAF8F5')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#4A0E17')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E0D8')),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 12))

    # --- System Architecture & Flowchart ---
    story.append(Paragraph("2. System Architecture & Component Flowchart", h1_style))
    story.append(Paragraph(
        "The application enforces strict separation of concerns through a decoupled single-page application (SPA) frontend "
        "and stateless backend microservice architecture.",
        body_style
    ))
    story.append(create_flowchart())
    story.append(Spacer(1, 14))

    # --- Database Schema & ER Model ---
    story.append(Paragraph("3. Database Models & Schema Specifications", h1_style))
    story.append(Paragraph(
        "The relational database schema is structured around 10 primary domain models linked via strict foreign key relationships:",
        body_style
    ))

    schema_data = [
        [Paragraph("<b>Model Name</b>", body_style), Paragraph("<b>Primary Table</b>", body_style), Paragraph("<b>Key Attributes & Relationships</b>", body_style)],
        [Paragraph("<b>User</b>", body_style), Paragraph("<code>users</code>", body_style), Paragraph("Name, Email, Google ID, Hashed Password, Role (customer/admin), Active Status", body_style)],
        [Paragraph("<b>Category</b>", body_style), Paragraph("<code>categories</code>", body_style), Paragraph("Name, Slug, Image URL, Parent ID (Self-referential hierarchy), Display Order", body_style)],
        [Paragraph("<b>Brand</b>", body_style), Paragraph("<code>brands</code>", body_style), Paragraph("Name, Slug, Logo URL, Active Status", body_style)],
        [Paragraph("<b>Product</b>", body_style), Paragraph("<code>products</code>", body_style), Paragraph("Title, Slug, SKU, Category ID (Nullable), Price, Fabric, Saree Type, Status", body_style)],
        [Paragraph("<b>ProductVariant</b>", body_style), Paragraph("<code>product_variants</code>", body_style), Paragraph("SKU, Color, Blouse Size, Price Override, Stock Quantity, Low Stock Threshold", body_style)],
        [Paragraph("<b>ProductImage</b>", body_style), Paragraph("<code>product_images</code>", body_style), Paragraph("Image URL, Is Hover Image, Display Order, Color Tag", body_style)],
        [Paragraph("<b>Order</b>", body_style), Paragraph("<code>orders</code>", body_style), Paragraph("Order Number, Customer ID, Total Amount, Payment Status, Shipping Address, Tracking", body_style)],
        [Paragraph("<b>InventoryTransaction</b>", body_style), Paragraph("<code>inventory_transactions</code>", body_style), Paragraph("Variant ID, Quantity Change, Resulting Stock, Type (stock_in/stock_out), Note", body_style)],
        [Paragraph("<b>ActivityLog</b>", body_style), Paragraph("<code>activity_logs</code>", body_style), Paragraph("Admin User ID, Action Description, Target Entity, Timestamp", body_style)],
    ]

    t_schema = Table(schema_data, colWidths=[1.4*inch, 1.6*inch, 3.8*inch])
    t_schema.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FAF8F5')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#4A0E17')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E0D8')),
    ]))
    story.append(t_schema)
    story.append(Spacer(1, 14))

    # --- Core Features & Modules ---
    story.append(Paragraph("4. Key Features & Workflows", h1_style))
    
    story.append(Paragraph("Customer Storefront Features:", h2_style))
    story.append(Paragraph("• <b>Luxury Saree Catalog</b>: Multi-faceted filters (Kanjivaram, Banarasi, Cotton, Silk, Organza), Occasion filters (Wedding, Festive, Party), and dynamic sorting.", bullet_style))
    story.append(Paragraph("• <b>Interactive Product Gallery</b>: Variant picker for Color and Blouse Size with real-time stock availability indicators.", bullet_style))
    story.append(Paragraph("• <b>Google OAuth Sign-In</b>: One-click authentication using Google OAuth 2.0 with automatic account creation.", bullet_style))
    story.append(Paragraph("• <b>Cart & Checkout Flow</b>: Address book management, coupon discount calculation, and Razorpay payment integration.", bullet_style))

    story.append(Paragraph("Admin Backoffice Features (`/admin`):", h2_style))
    story.append(Paragraph("• <b>Dashboard KPIs & Analytics</b>: Revenue summary, order status distribution charts (Recharts), and low-stock alerts.", bullet_style))
    story.append(Paragraph("• <b>Product & Variant Management</b>: Full CRUD control, direct Cloudinary drag-and-drop image uploads, and stock level controls.", bullet_style))
    story.append(Paragraph("• <b>Safe Category Deletion</b>: Automatically unassigns linked products without corrupting catalog data or throwing errors.", bullet_style))
    story.append(Paragraph("• <b>Inventory Audit Trail</b>: Immutable ledger logging every stock adjustment and manual inventory change.", bullet_style))
    story.append(Spacer(1, 14))

    # --- Setup & Deployment Guide ---
    story.append(Paragraph("5. Local Setup & Production Deployment", h1_style))
    
    story.append(Paragraph("Local Quickstart Commands:", h2_style))
    story.append(Paragraph("<code># Backend Setup (FastAPI + PostgreSQL)\ncd backend\npython -m venv venv\n.\\venv\\Scripts\\Activate.ps1\npip install -r requirements.txt\npython -m alembic upgrade head\nuvicorn app.main:app --reload --port 8000\n\n# Frontend Setup (React + Vite)\ncd frontend\nnpm install\nnpm run dev</code>", code_style))

    story.append(Paragraph("Production Cloud Deployment:", h2_style))
    story.append(Paragraph("• <b>Render (Backend API & PostgreSQL)</b>: Continuous deployment from <code>main</code> branch with automated Alembic migration runner.", bullet_style))
    story.append(Paragraph("• <b>Vercel (Frontend SPA)</b>: Single-page app routing powered by Vite build pipeline with rewrite fallback rules.", bullet_style))
    story.append(Paragraph("• <b>GitHub Actions CI</b>: Automated workflows verifying Python compilation and React production build output on every push.", bullet_style))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF documentation at: {pdf_path}")


if __name__ == "__main__":
    generate_pdf()
