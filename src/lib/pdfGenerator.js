import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export async function generateShiftChangePDF(shiftData, posterProfile, recipientProfile) {
  try {
    // Load the template PDF
    // In dev mode, use root path; in production, use BASE_URL
    const isDev = import.meta.env.DEV
    const templateUrl = isDev
      ? '/assets/SHIFT%20SWAP.pdf'
      : `${import.meta.env.BASE_URL}assets/SHIFT%20SWAP.pdf`

    const response = await fetch(templateUrl)
    if (!response.ok) {
      throw new Error(`Failed to load PDF template from ${templateUrl}: ${response.status} ${response.statusText}`)
    }
    const templateBytes = await response.arrayBuffer()
    const pdfDoc = await PDFDocument.load(templateBytes)

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    // Embed fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const black = rgb(0, 0, 0)

    // Determine if this is a Giveaway or Swap
    const isSwap = shiftData.type === 'Swap' && shiftData.proposerShift

    // Text size - larger
    const textSize = 20
    const signatureScale = 0.22

    if (isSwap) {
      // SWAP SECTION - Two column layout (Employee 1 and Employee 2)

      // Employee 1 (Poster) - Left Column
      // Name of staff 1
      firstPage.drawText(posterProfile.full_name, {
        x: 315,
        y: height - 1630,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // # of staff 1
      firstPage.drawText(posterProfile.staff_id, {
        x: 360,
        y: height - 1700,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Date of original shift of staff 1
      firstPage.drawText(formatDate(shiftData.date), {
        x: 450,
        y: height - 1755,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Shift time (start and end)
      firstPage.drawText(`${formatTime(shiftData.start_time)} - ${formatTime(shiftData.end_time)}`, {
        x: 490,
        y: height - 1815,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Role/area of work
      firstPage.drawText(shiftData.area, {
        x: 430,
        y: height - 1875,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Tick box for staff 1
      firstPage.drawText('X', {
        x: 155,
        y: height - 1960,
        size: 14,
        font: helveticaBold,
        color: black,
      })

      // Signature of staff 1
      if (posterProfile.signature_blob) {
        try {
          const posterSignatureImage = await pdfDoc.embedPng(posterProfile.signature_blob)
          const signatureDims = posterSignatureImage.scale(signatureScale)
          firstPage.drawImage(posterSignatureImage, {
            x: 305,
            y: height - 2045 - signatureDims.height,
            width: signatureDims.width,
            height: signatureDims.height,
          })
        } catch (e) {
          console.error('Error embedding poster signature:', e)
        }
      }

      // Date for staff 1
      firstPage.drawText(formatDateShort(new Date()), {
        x: 250,
        y: height - 2125,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Employee 2 (Recipient) - Right Column (add 845 to x coordinate)
      // Name of staff 2
      firstPage.drawText(recipientProfile.full_name, {
        x: 315 + 845,
        y: height - 1630,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // # of staff 2
      firstPage.drawText(recipientProfile.staff_id, {
        x: 360 + 845,
        y: height - 1700,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Date of original shift of staff 2
      firstPage.drawText(formatDate(shiftData.proposerShift.date), {
        x: 450 + 845,
        y: height - 1755,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Shift time (start and end)
      firstPage.drawText(`${formatTime(shiftData.proposerShift.start_time)} - ${formatTime(shiftData.proposerShift.end_time)}`, {
        x: 490 + 845,
        y: height - 1815,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Role/area of work
      firstPage.drawText(shiftData.proposerShift.area, {
        x: 430 + 845,
        y: height - 1875,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Tick box for staff 2
      firstPage.drawText('X', {
        x: 155 + 845,
        y: height - 1960,
        size: 14,
        font: helveticaBold,
        color: black,
      })

      // Signature of staff 2
      if (recipientProfile.signature_blob) {
        try {
          const recipientSignatureImage = await pdfDoc.embedPng(recipientProfile.signature_blob)
          const signatureDims = recipientSignatureImage.scale(signatureScale)
          firstPage.drawImage(recipientSignatureImage, {
            x: 305 + 845,
            y: height - 2045 - signatureDims.height,
            width: signatureDims.width,
            height: signatureDims.height,
          })
        } catch (e) {
          console.error('Error embedding recipient signature:', e)
        }
      }

      // Date for staff 2
      firstPage.drawText(formatDateShort(new Date()), {
        x: 250 + 845,
        y: height - 2125,
        size: textSize,
        font: helvetica,
        color: black,
      })

    } else {
      // GIVEAWAY SECTION

      // Name of staff giving shift
      firstPage.drawText(posterProfile.full_name, {
        x: 330,
        y: height - 1036,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // # of staff giving shift
      firstPage.drawText(posterProfile.staff_id, {
        x: 1206,
        y: height - 1036,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Date of original shift
      firstPage.drawText(formatDate(shiftData.date), {
        x: 470,
        y: height - 1100,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Shift time (start and end)
      firstPage.drawText(`${formatTime(shiftData.start_time)} - ${formatTime(shiftData.end_time)}`, {
        x: 1340,
        y: height - 1100,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Area of work
      firstPage.drawText(shiftData.area, {
        x: 445,
        y: height - 1155,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Date (for area section)
      firstPage.drawText(formatDateShort(new Date()), {
        x: 1100,
        y: height - 1155,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Tick box for "I agree to give this shift away"
      firstPage.drawText('X', {
        x: 173,
        y: height - 1197,
        size: 14,
        font: helveticaBold,
        color: black,
      })

      // Signature of staff giving shift
      if (posterProfile.signature_blob) {
        try {
          const posterSignatureImage = await pdfDoc.embedPng(posterProfile.signature_blob)
          const signatureDims = posterSignatureImage.scale(signatureScale)
          firstPage.drawImage(posterSignatureImage, {
            x: 330,
            y: height - 1247 - signatureDims.height,
            width: signatureDims.width,
            height: signatureDims.height,
          })
        } catch (e) {
          console.error('Error embedding poster signature:', e)
        }
      }

      // Tick box for staff taking shift
      firstPage.drawText('X', {
        x: 160,
        y: height - 1350,
        size: 14,
        font: helveticaBold,
        color: black,
      })

      // Name of staff taking shift
      firstPage.drawText(recipientProfile.full_name, {
        x: 325,
        y: height - 1410,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // # of staff taking shift
      firstPage.drawText(recipientProfile.staff_id, {
        x: 1330,
        y: height - 1410,
        size: textSize,
        font: helvetica,
        color: black,
      })

      // Signature of staff taking shift
      if (recipientProfile.signature_blob) {
        try {
          const recipientSignatureImage = await pdfDoc.embedPng(recipientProfile.signature_blob)
          const signatureDims = recipientSignatureImage.scale(signatureScale)
          firstPage.drawImage(recipientSignatureImage, {
            x: 320,
            y: height - 1455 - signatureDims.height,
            width: signatureDims.width,
            height: signatureDims.height,
          })
        } catch (e) {
          console.error('Error embedding recipient signature:', e)
        }
      }

      // Date (for signature)
      firstPage.drawText(formatDateShort(new Date()), {
        x: 1225,
        y: height - 1475,
        size: textSize,
        font: helvetica,
        color: black,
      })
    }

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save()

    // Convert to blob
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })

    return blob
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

function formatTime(time) {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}

function formatDateShort(date) {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  })
}
