// backend/utils/pdfGenerator.js
const puppeteer = require("puppeteer");

/**
 * generateChatPDF
 * @param {Response} res - Express response object
 * @param {Array} chatHistory - Array of messages [{role, content, createdAt}]
 * @param {String} filename - Name of PDF file
 */
async function generateChatPDF(
  res,
  chatHistory,
  filename = "chat_history.pdf"
) {
  try {
    // Generate HTML for chat
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Chat History</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
          h1 { text-align: center; color: #333; }
          .chat { max-width: 800px; margin: auto; }
          .message { margin: 10px 0; padding: 10px; border-radius: 8px; width: fit-content; max-width: 70%; }
          .user { background: #d0e6ff; align-self: flex-end; margin-left: auto; }
          .assistant { background: #d5ffd0; align-self: flex-start; margin-right: auto; }
          .timestamp { font-size: 0.7em; color: #666; margin-top: 2px; }
          .chat-container { display: flex; flex-direction: column; }
        </style>
      </head>
      <body>
        <h1>Chat History</h1>
        <div class="chat">
          ${chatHistory
            .map(
              (msg) => `
            <div class="chat-container">
              <div class="message ${
                msg.role === "user" ? "user" : "assistant"
              }">
                ${msg.content
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/\n/g, "<br>")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </body>
      </html>
    `;

    // Launch Puppeteer
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    // Send PDF
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

module.exports = generateChatPDF;
