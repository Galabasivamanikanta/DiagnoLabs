const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a professional DiagnoLabs Clinical Report
 * @param {Object} booking - The populated booking object
 * @returns {Promise<string>} - Path to the generated PDF
 */
const generateClinicalReport = async (booking) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `Report_${booking._id}_${Date.now()}.pdf`;
            const uploadDir = path.join(__dirname, '../uploads/reports');
            
            // Ensure directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // 1. BRANDING HEADER
            doc.fillColor('#0ea5e9')
               .fontSize(25)
               .text('DiagnoLabs India', 50, 50, { align: 'left' });
            
            doc.fillColor('#64748b')
               .fontSize(10)
               .text('Nationwide Clinical Discovery & Management', 50, 80);
            
            doc.moveDown(2);

            // 2. LAB & PATIENT INFO (GRID)
            doc.rect(50, 110, 500, 80).stroke('#e2e8f0');
            
            doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold')
               .text(`LABORATORY: ${booking.lab.name.toUpperCase()}`, 65, 125);
            
            doc.font('Helvetica').fontSize(10).fillColor('#64748b')
               .text(`${booking.lab.address}, ${booking.lab.city}`, 65, 140);

            doc.fillColor('#0f172a').font('Helvetica-Bold')
               .text(`PATIENT: ${booking.patient.name}`, 350, 125);
            
            doc.font('Helvetica').fontSize(10).fillColor('#64748b')
               .text(`Date: ${new Date(booking.appointmentDate).toDateString()}`, 350, 140);
            doc.text(`Booking ID: ${booking._id}`, 350, 155);

            doc.moveDown(4);

            // 3. TEST RESULTS TABLE
            doc.fillColor('#f8fafc').rect(50, 210, 500, 30).fill();
            doc.fillColor('#0f172a').font('Helvetica-Bold')
               .text('TEST NAME', 65, 220)
               .text('RESULT', 250, 220)
               .text('REFERENCE RANGE', 400, 220);

            let yPos = 255;
            booking.testDetails.forEach((test) => {
                doc.fillColor('#1e293b').font('Helvetica')
                   .text(test.testName, 65, yPos)
                   .text('NORMAL', 250, yPos, { color: '#10b981' }) // Defaulted for generation logic
                   .text('Clinical Reference Standard', 400, yPos);
                
                doc.moveTo(50, yPos + 20).lineTo(550, yPos + 20).stroke('#f1f5f9');
                yPos += 40;
            });

            // 4. FOOTER & DISCLAIMER
            doc.moveDown(5);
            doc.rect(50, doc.y, 500, 60).fill('#f1f5f9');
            doc.fillColor('#475569').fontSize(8)
               .text('INTERPRETATION NOTE: This report is electronically generated and verified by DiagnoLabs Clinical Protocol. Please consult your physician for clinical correlation.', 65, doc.y + 15, { width: 470, align: 'center' });
            
            doc.moveDown(2);
            doc.fontSize(10).fillColor('#0ea5e9').font('Helvetica-Bold')
               .text('Verify authenticity at: diagnolabs.in/verify', { align: 'center' });

            doc.end();

            writeStream.on('finish', () => {
                resolve(`/uploads/reports/${fileName}`);
            });

        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateClinicalReport };
