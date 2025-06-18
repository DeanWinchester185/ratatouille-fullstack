const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

async function convertToPng(imagePath, userId = null, recipeId = null, stepIndex = null) {
  try {
    let outputPath;
    if (recipeId != null) {
      const fileName = stepIndex !== null ? `${recipeId}_${stepIndex + 1}.png` : `${recipeId}.png`;

      outputPath = path.join(__dirname, "../public/images/recipes", fileName);
    } else {
      outputPath = path.join(__dirname, "../public/images/avatars", userId + ".png");
    }
    await sharp(imagePath).png().toFile(outputPath);
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.error("Ошибка при удалении временного файла:", error);
    }

    return outputPath;
  } catch (error) {
    console.error("Ошибка конвертации изображения:", error);
    throw error;
  }
}

module.exports = { convertToPng };
