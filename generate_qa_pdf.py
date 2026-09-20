import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
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
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def build_pdf(pdf_path):
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    styles = getSampleStyleSheet()

    # Custom Palette
    PRIMARY_COLOR = colors.HexColor("#16A34A")    # Forest Green
    SECONDARY_COLOR = colors.HexColor("#0D9488")  # Teal Accent
    DARK_TEXT = colors.HexColor("#1F2937")        # Charcoal
    LIGHT_BG = colors.HexColor("#F8FAFC")         # Slate Light
    BORDER_COLOR = colors.HexColor("#E2E8F0")     # Light Gray Border
    PASS_GREEN = colors.HexColor("#15803D")       # Darker Green for Pass
    PASS_BG = colors.HexColor("#DCFCE7")          # Light Green Pill

    # Typography Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=PRIMARY_COLOR,
        alignment=TA_LEFT,
        fontName="Helvetica-Bold",
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#4B5563"),
        alignment=TA_LEFT,
        fontName="Helvetica",
        spaceAfter=12,
    )

    h2_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        textColor=PRIMARY_COLOR,
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyText",
        parent=styles["Normal"],
        fontSize=9,
        leading=12,
        textColor=DARK_TEXT,
        fontName="Helvetica",
        spaceAfter=4,
    )

    bold_body = ParagraphStyle(
        "BoldBody",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=10,
        textColor=colors.white,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
        textColor=DARK_TEXT,
        fontName="Helvetica",
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=table_cell_style,
        fontName="Helvetica-Bold",
    )

    pass_pill_style = ParagraphStyle(
        "PassPill",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
        textColor=PASS_GREEN,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("FoodBridge (Anna Setu) — QA Audit & Testing Report", title_style))
    story.append(Paragraph("Official Software QA Audit Verification & Defect Resolution Document | Date: September 20, 2026", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY_COLOR, spaceAfter=10))

    # 2. Executive Summary Banner Box
    summary_html = """
    <b>EXECUTIVE SUMMARY & TEST STATUS:</b><br/>
    The Software QA Audit for <b>FoodBridge (Anna Setu)</b> has been completed. All <b>13 reported defects (BUG-001 through BUG-013)</b> have been fully remediated and verified. The automated API test suite executed <b>22/22 test cases with a 100% PASS RATE</b> across authentication, IDOR authorization checks, Socket.io JWT security, atomic concurrency controls, rate limiting, and data integrity metrics.
    """
    summary_p = Paragraph(summary_html, body_style)
    summary_table = Table([[summary_p]], colWidths=[7.5 * inch])
    summary_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PASS_BG),
            ("BOX", (0, 0), (-1, -1), 1, PASS_GREEN),
            ("PADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(summary_table)
    story.append(Spacer(1, 10))

    # 3. Access Links & Demo Credentials
    story.append(Paragraph("1. System Endpoints & Demo Credentials", h2_style))
    
    cred_data = [
        [
            Paragraph("Component / Role", table_header_style),
            Paragraph("URL / Email", table_header_style),
            Paragraph("Password", table_header_style),
            Paragraph("Description", table_header_style),
        ],
        [
            Paragraph("<b>Frontend Web UI</b>", table_cell_bold),
            Paragraph("<u>http://localhost:5173</u>", table_cell_style),
            Paragraph("N/A", table_cell_style),
            Paragraph("React UI Output (All 4 User Dashboards)", table_cell_style),
        ],
        [
            Paragraph("<b>Backend REST API</b>", table_cell_bold),
            Paragraph("<u>http://localhost:5000/api/health</u>", table_cell_style),
            Paragraph("N/A", table_cell_style),
            Paragraph("Express API Server & Socket.io Layer", table_cell_style),
        ],
        [
            Paragraph("Super Admin", table_cell_style),
            Paragraph("admin@foodbridge.org", table_cell_style),
            Paragraph("password123", table_cell_style),
            Paragraph("Analytics, Verification Queue, Suspension", table_cell_style),
        ],
        [
            Paragraph("Restaurant Owner", table_cell_style),
            Paragraph("spicegarden@restaurant.com", table_cell_style),
            Paragraph("password123", table_cell_style),
            Paragraph("Post Surplus, Accept Claims, Pickup OTP", table_cell_style),
        ],
        [
            Paragraph("Primary NGO", table_cell_style),
            Paragraph("contact@feedinghope.org", table_cell_style),
            Paragraph("password123", table_cell_style),
            Paragraph("Browse, Claim, OTP Verify, Proof Upload", table_cell_style),
        ],
        [
            Paragraph("Volunteer Delivery", table_cell_style),
            Paragraph("rahul.volunteer@gmail.com", table_cell_style),
            Paragraph("password123", table_cell_style),
            Paragraph("Task Accept, GPS Tracking, Delivery Proof", table_cell_style),
        ],
    ]

    cred_table = Table(cred_data, colWidths=[1.4 * inch, 2.2 * inch, 1.1 * inch, 2.8 * inch])
    cred_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ])
    )
    story.append(cred_table)
    story.append(Spacer(1, 10))

    # 4. Defect Resolutions Matrix
    story.append(Paragraph("2. QA Audit Defect Remediation Matrix (BUG-001 to BUG-013)", h2_style))

    bugs_data = [
        [
            Paragraph("Defect ID", table_header_style),
            Paragraph("Severity", table_header_style),
            Paragraph("Target File", table_header_style),
            Paragraph("Root Cause & Security Fix Applied", table_header_style),
            Paragraph("Status", table_header_style),
        ],
        [
            Paragraph("<b>BUG-001</b>", table_cell_bold),
            Paragraph("<font color='red'>P0 Critical</font>", table_cell_style),
            Paragraph("authController.js", table_cell_style),
            Paragraph("Restricted self-registration to ['restaurant', 'ngo', 'volunteer']. Blocked role='admin' on public endpoint.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-002</b>", table_cell_bold),
            Paragraph("<font color='orange'>P1 High</font>", table_cell_style),
            Paragraph("ngoController.js", table_cell_style),
            Paragraph("Added NGO ownership check in submitDistributionProof (ngoId === req.user._id), returning HTTP 403.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-003</b>", table_cell_bold),
            Paragraph("<font color='orange'>P1 High</font>", table_cell_style),
            Paragraph("volunteerController.js", table_cell_style),
            Paragraph("Added volunteer ownership check in submitVolunteerDeliveryProof, returning HTTP 403.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-004</b>", table_cell_bold),
            Paragraph("<font color='orange'>P1 High</font>", table_cell_style),
            Paragraph("chatController.js", table_cell_style),
            Paragraph("Added donation participant check for chat thread read/write (get/sendDonationMessages).", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-005</b>", table_cell_bold),
            Paragraph("<font color='orange'>P1 High</font>", table_cell_style),
            Paragraph("chatController.js", table_cell_style),
            Paragraph("Added participant validation for rating submission and blocked self-ratings.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-006</b>", table_cell_bold),
            Paragraph("<font color='orange'>P1 High</font>", table_cell_style),
            Paragraph("socketHandler.js", table_cell_style),
            Paragraph("Added Socket.io JWT authentication middleware (io.use) and derived sender from verified token session.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-007</b>", table_cell_bold),
            Paragraph("P3 Concurrency", table_cell_style),
            Paragraph("volunteerController.js", table_cell_style),
            Paragraph("Atomic findOneAndUpdate on { _id, status: 'assigned', $or: [{volunteerId: null}, {volunteerId: user._id}] }.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-008</b>", table_cell_bold),
            Paragraph("P2 Security", table_cell_style),
            Paragraph("rateLimiter.js", table_cell_style),
            Paragraph("Applied express-rate-limit to POST /api/auth/login and sensitive OTP verification endpoints.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-009</b>", table_cell_bold),
            Paragraph("P2 Security", table_cell_style),
            Paragraph("generateToken.js", table_cell_style),
            Paragraph("Enforced strict JWT_SECRET check without hardcoded insecure fallbacks.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-010</b>", table_cell_bold),
            Paragraph("P2 Integrity", table_cell_style),
            Paragraph("Donation.js", table_cell_style),
            Paragraph("Added quantityKg to Donation schema and updated getAdminStats to aggregate total food saved accurately.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-011</b>", table_cell_bold),
            Paragraph("P3 Operational", table_cell_style),
            Paragraph("adminController.js", table_cell_style),
            Paragraph("Blocked Admin account suspension in toggleUserSuspension with HTTP 400 error.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-012</b>", table_cell_bold),
            Paragraph("P3 Integrity", table_cell_style),
            Paragraph("restaurantController.js", table_cell_style),
            Paragraph("Validated claim request status (pending) and verified volunteer account status before accepting.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
        [
            Paragraph("<b>BUG-013</b>", table_cell_bold),
            Paragraph("P3 Data Quality", table_cell_style),
            Paragraph("adminController.js", table_cell_style),
            Paragraph("Grouped city heatmap aggregation by normalized city name rather than free-text address.", table_cell_style),
            Paragraph("PASSED", pass_pill_style),
        ],
    ]

    bugs_table = Table(bugs_data, colWidths=[0.8 * inch, 0.9 * inch, 1.3 * inch, 3.7 * inch, 0.8 * inch])
    bugs_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), SECONDARY_COLOR),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("PADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ])
    )
    story.append(bugs_table)
    story.append(Spacer(1, 10))

    # 5. Full Test Suite Results
    story.append(Paragraph("3. Automated API Test Suite Execution Log (22 / 22 Passed)", h2_style))

    test_logs = [
        ("TC-01", "GET /api/health - Server Status Check", "PASSED"),
        ("TC-02", "POST /api/auth/login - Super Admin Login", "PASSED"),
        ("TC-03", "POST /api/auth/login - Restaurant Owner Login", "PASSED"),
        ("TC-04", "POST /api/auth/login - Primary NGO Login", "PASSED"),
        ("TC-05", "POST /api/auth/login - Secondary NGO Login (Annam Seva)", "PASSED"),
        ("TC-06", "POST /api/auth/login - Volunteer Delivery Login (Rahul)", "PASSED"),
        ("TC-07", "POST /api/auth/login - Volunteer Delivery Login (Priya)", "PASSED"),
        ("TC-08", "BUG-001 Fix: Reject self-registration with role='admin'", "PASSED"),
        ("TC-09", "POST /api/restaurant/listings - Create Surplus Food Listing", "PASSED"),
        ("TC-10", "POST /api/ngo/listings/:id/claim - Primary NGO Claims Listing", "PASSED"),
        ("TC-11", "PUT /api/restaurant/listings/:id/claim-response - Accept Claim & Issue OTP", "PASSED"),
        ("TC-12", "BUG-012 Fix: Reject claim-response for non-pending claim request", "PASSED"),
        ("TC-13", "POST /api/volunteer/tasks/:id/accept - Volunteer Accepts Task", "PASSED"),
        ("TC-14", "BUG-007 Fix: Reject second volunteer attempting double task accept", "PASSED"),
        ("TC-15", "BUG-002 Fix: Block unauthorized NGO from submitting distribution proof", "PASSED"),
        ("TC-16", "BUG-003 Fix: Block unauthorized volunteer from submitting delivery proof", "PASSED"),
        ("TC-17", "BUG-004 Fix: Block non-participant from reading donation chat thread", "PASSED"),
        ("TC-18", "BUG-005 Fix: Block rating submission for non-participants", "PASSED"),
        ("TC-19", "BUG-011 Fix: Prevent Admin account suspension", "PASSED"),
        ("TC-20", "POST /api/volunteer/tasks/:id/verify-otp - Verify Restaurant Pickup OTP", "PASSED"),
        ("TC-21", "POST /api/volunteer/tasks/:id/complete-delivery - Authorized Volunteer Delivery Proof", "PASSED"),
        ("TC-22", "BUG-010 & BUG-013 Fix: Verify Admin Stats calculation and city Heatmap grouping", "PASSED"),
    ]

    log_table_data = [
        [
            Paragraph("Test ID", table_header_style),
            Paragraph("Test Case Description & Verification Goal", table_header_style),
            Paragraph("Result", table_header_style),
        ]
    ]

    for tid, desc, res in test_logs:
        log_table_data.append([
            Paragraph(f"<b>{tid}</b>", table_cell_bold),
            Paragraph(desc, table_cell_style),
            Paragraph(f"<b>{res}</b>", pass_pill_style),
        ])

    log_table = Table(log_table_data, colWidths=[1.0 * inch, 5.5 * inch, 1.0 * inch])
    log_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("PADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ])
    )
    story.append(log_table)

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY_COLOR, spaceAfter=8))
    story.append(Paragraph("<b>FoodBridge Quality Assurance & Security Engineering Team</b> | All Rights Reserved", ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, alignment=TA_CENTER, textColor=colors.HexColor("#6B7280"))))

    doc.build(story)
    print(f"[OK] PDF successfully generated at: {pdf_path}")

if __name__ == "__main__":
    target_path1 = r"C:\Users\Intel\.gemini\antigravity-ide\scratch\FoodBridge\FoodBridge_QA_Audit_Test_Report.pdf"
    target_path2 = r"C:\Users\Intel\.gemini\antigravity-ide\scratch\FoodBridge_QA_Audit_Test_Report.pdf"
    build_pdf(target_path1)
    build_pdf(target_path2)
