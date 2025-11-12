/**
 * PLAN B CRM - Image Optimization Script
 * Optimisation automatique des images pour le web
 * Version: 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, 'images'),
  outputDir: path.join(__dirname, 'images-optimized'),
  formats: {
    jpg: { quality: 80, progressive: true },
    png: { quality: 80, compressionLevel: 9 },
    webp: { quality: 80 }
  },
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 480 },
    medium: { width: 1024 },
    large: { width: 1920 }
  },
  generateWebP: true,
  generateResponsive: true
};

// Utilitaires de log
const log = {
  info: (msg) => console.log(`\x1b[36mℹ ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✓ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m✗ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠ ${msg}\x1b[0m`)
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Créer les dossiers de sortie
async function ensureOutputDirs() {
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    if (CONFIG.generateResponsive) {
      for (const sizeName of Object.keys(CONFIG.sizes)) {
        await fs.mkdir(path.join(CONFIG.outputDir, sizeName), { recursive: true });
      }
    }

    log.info('Dossiers de sortie créés');
  } catch (error) {
    log.error(`Erreur lors de la création des dossiers: ${error.message}`);
    throw error;
  }
}

// Vérifier si le dossier source existe
async function checkSourceDir() {
  try {
    await fs.access(CONFIG.sourceDir);
    return true;
  } catch (error) {
    return false;
  }
}

// Lister toutes les images dans le dossier source
async function getImageFiles() {
  try {
    const files = await fs.readdir(CONFIG.sourceDir);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp'];

    return files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
  } catch (error) {
    log.error(`Erreur lors de la lecture du dossier: ${error.message}`);
    return [];
  }
}

// Optimiser une image
async function optimizeImage(filename) {
  try {
    const inputPath = path.join(CONFIG.sourceDir, filename);
    const ext = path.extname(filename).toLowerCase();
    const baseName = path.basename(filename, ext);

    // Obtenir la taille du fichier original
    const stats = await fs.stat(inputPath);
    const originalSize = stats.size;

    const results = {
      original: filename,
      originalSize,
      outputs: []
    };

    // Créer l'instance Sharp
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    log.info(`\nTraitement de ${filename} (${metadata.width}x${metadata.height}, ${formatBytes(originalSize)})`);

    // 1. Optimiser l'image originale
    const outputPath = path.join(CONFIG.outputDir, `${baseName}${ext}`);

    let outputImage = sharp(inputPath);

    if (ext === '.jpg' || ext === '.jpeg') {
      outputImage = outputImage.jpeg(CONFIG.formats.jpg);
    } else if (ext === '.png') {
      outputImage = outputImage.png(CONFIG.formats.png);
    }

    await outputImage.toFile(outputPath);
    const outputStats = await fs.stat(outputPath);
    const reduction = ((1 - outputStats.size / originalSize) * 100).toFixed(1);

    results.outputs.push({
      file: `${baseName}${ext}`,
      size: outputStats.size,
      reduction
    });

    log.success(`  Original optimisée: ${formatBytes(outputStats.size)} (-${reduction}%)`);

    // 2. Générer version WebP (si demandé)
    if (CONFIG.generateWebP) {
      const webpPath = path.join(CONFIG.outputDir, `${baseName}.webp`);
      await sharp(inputPath)
        .webp(CONFIG.formats.webp)
        .toFile(webpPath);

      const webpStats = await fs.stat(webpPath);
      const webpReduction = ((1 - webpStats.size / originalSize) * 100).toFixed(1);

      results.outputs.push({
        file: `${baseName}.webp`,
        size: webpStats.size,
        reduction: webpReduction
      });

      log.success(`  WebP créée: ${formatBytes(webpStats.size)} (-${webpReduction}%)`);
    }

    // 3. Générer versions responsive (si demandé)
    if (CONFIG.generateResponsive) {
      for (const [sizeName, dimensions] of Object.entries(CONFIG.sizes)) {
        // Ne pas générer si l'image est déjà plus petite
        if (metadata.width <= dimensions.width) continue;

        const responsivePath = path.join(
          CONFIG.outputDir,
          sizeName,
          `${baseName}-${sizeName}${ext}`
        );

        let responsiveImage = sharp(inputPath).resize(dimensions);

        if (ext === '.jpg' || ext === '.jpeg') {
          responsiveImage = responsiveImage.jpeg(CONFIG.formats.jpg);
        } else if (ext === '.png') {
          responsiveImage = responsiveImage.png(CONFIG.formats.png);
        }

        await responsiveImage.toFile(responsivePath);
        const responsiveStats = await fs.stat(responsivePath);

        results.outputs.push({
          file: `${sizeName}/${baseName}-${sizeName}${ext}`,
          size: responsiveStats.size
        });

        log.info(`  ${sizeName}: ${dimensions.width}px - ${formatBytes(responsiveStats.size)}`);

        // Version WebP responsive
        if (CONFIG.generateWebP) {
          const webpResponsivePath = path.join(
            CONFIG.outputDir,
            sizeName,
            `${baseName}-${sizeName}.webp`
          );

          await sharp(inputPath)
            .resize(dimensions)
            .webp(CONFIG.formats.webp)
            .toFile(webpResponsivePath);

          const webpResponsiveStats = await fs.stat(webpResponsivePath);

          results.outputs.push({
            file: `${sizeName}/${baseName}-${sizeName}.webp`,
            size: webpResponsiveStats.size
          });
        }
      }
    }

    return results;
  } catch (error) {
    log.error(`Erreur lors de l'optimisation de ${filename}: ${error.message}`);
    return null;
  }
}

// Optimiser toutes les images
async function optimizeAll() {
  console.log('\n🖼️  Démarrage de l\'optimisation d\'images...\n');

  const startTime = Date.now();
  const stats = {
    totalFiles: 0,
    totalOriginalSize: 0,
    totalOutputSize: 0,
    results: []
  };

  try {
    // Vérifier si le dossier source existe
    const sourceExists = await checkSourceDir();

    if (!sourceExists) {
      log.warn(`Le dossier ${CONFIG.sourceDir} n'existe pas.`);
      log.info('Création du dossier...');
      await fs.mkdir(CONFIG.sourceDir, { recursive: true });
      log.info(`Placez vos images dans ${CONFIG.sourceDir} et relancez le script.`);
      return;
    }

    // Créer les dossiers de sortie
    await ensureOutputDirs();

    // Lister les images
    const imageFiles = await getImageFiles();

    if (imageFiles.length === 0) {
      log.warn('Aucune image trouvée dans le dossier source.');
      log.info(`Placez vos images (JPG, PNG, GIF, etc.) dans ${CONFIG.sourceDir}`);
      return;
    }

    stats.totalFiles = imageFiles.length;
    log.info(`${imageFiles.length} image(s) trouvée(s)`);

    // Optimiser chaque image
    for (const file of imageFiles) {
      const result = await optimizeImage(file);
      if (result) {
        stats.results.push(result);
        stats.totalOriginalSize += result.originalSize;
        stats.totalOutputSize += result.outputs.reduce((sum, o) => sum + o.size, 0);
      }
    }

    // Statistiques finales
    const totalReduction = stats.totalOriginalSize > 0
      ? ((1 - stats.totalOutputSize / stats.totalOriginalSize) * 100).toFixed(1)
      : 0;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    log.success('Optimisation terminée !');
    console.log('='.repeat(60));
    console.log(`\n📊 Statistiques:`);
    console.log(`  Images traitées: ${stats.results.length}/${stats.totalFiles}`);
    console.log(`  Taille originale: ${formatBytes(stats.totalOriginalSize)}`);
    console.log(`  Taille optimisée: ${formatBytes(stats.totalOutputSize)}`);
    console.log(`  Réduction totale: -${totalReduction}%`);
    console.log(`  Économie: ${formatBytes(stats.totalOriginalSize - stats.totalOutputSize)}`);
    console.log(`  Durée: ${duration}s`);
    console.log(`\n📁 Fichiers générés dans: ${CONFIG.outputDir}\n`);

    // Générer le HTML d'exemple pour <picture>
    if (CONFIG.generateResponsive && CONFIG.generateWebP) {
      log.info('💡 Exemple d\'utilisation (HTML):');
      const exampleFile = stats.results[0];
      if (exampleFile) {
        const baseName = path.basename(exampleFile.original, path.extname(exampleFile.original));
        console.log(`
<picture>
  <source
    srcset="images-optimized/small/${baseName}-small.webp 480w,
            images-optimized/medium/${baseName}-medium.webp 1024w,
            images-optimized/large/${baseName}-large.webp 1920w"
    sizes="(max-width: 768px) 480px, (max-width: 1440px) 1024px, 1920px"
    type="image/webp">
  <img
    src="images-optimized/${baseName}.jpg"
    alt="Description"
    loading="lazy">
</picture>
        `);
      }
    }

  } catch (error) {
    log.error(`Optimisation échouée: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter
if (require.main === module) {
  optimizeAll();
}

module.exports = { optimizeAll, optimizeImage };
