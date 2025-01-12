const express = require("express");
const router = express.Router();
const db = require("../db");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const path = require("path");

router.get("/dashboard", async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    return res.redirect("/user/login"); // Redirect to login if not authenticated
  }

  try {
    // Fetch the list of existing vouchers from the database
    const [vouchers] = await db.query(
      "SELECT * FROM Vouchers WHERE user_id = ?",
      [req.session.user.id]
    );

    // Pass user data and vouchers to the dashboard view
    res.render("dashboard", { user: req.session.user, vouchers });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while fetching vouchers.");
  }
});

router.post("/generateQRCode", async (req, res) => {
  try {
    // Generate a 10-digit random number
    const randomNumber = Math.floor(Math.random() * 10000000000); // 10-digit number

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(randomNumber.toString());

    // Get current date and expiry date (1 day from now, for example)
    const currentDate = new Date();
    const expiryDate = new Date(currentDate);
    expiryDate.setDate(currentDate.getDate() + 1); // 1 day expiry

    // Insert QR code details into the database
    const [result] = await db.query(
      "INSERT INTO qr_code (expiry_date) VALUES (?)",
      [expiryDate]
    );

    // Send success response
    res.send({
      status: "ok",
      message: "QR code generated and saved successfully!",
      qrCode: qrCodeData,
      qrCodeId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred. Please try again.");
  }
});

router.get("/generatePDF/:voucherId", async (req, res) => {
  const { voucherId } = req.params;

  try {
    // Fetch the voucher details from the database
    const [voucherResult] = await db.query(
      "SELECT * FROM Vouchers WHERE id = ?",
      [voucherId]
    );

    if (!voucherResult || voucherResult.length === 0) {
      return res.status(404).send("Voucher not found.");
    }

    const voucher = voucherResult[0];

    // Create a new PDF document
    const doc = new PDFDocument();
    const fileName = `Voucher-${voucher.id}.pdf`;

    // Set the response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text("Voucher Details", { align: "center" });

    // Add generated date and expiry date
    doc.moveDown();
    doc.fontSize(14).text(`Generated Date: ${voucher.generated_date}`);
    doc.fontSize(14).text(`Expiry Date: ${voucher.expiry_date}`);

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(voucher.code);

    // Add QR code image to the center of the PDF
    const qrImagePath = path.join(__dirname, "../temp/qr-code.png");
    const qrBuffer = Buffer.from(qrCodeData.split(",")[1], "base64");

    doc.image(qrBuffer, {
      fit: [150, 150],
      align: "center",
      valign: "center",
    });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while generating the PDF.");
  }
});

module.exports = router;
