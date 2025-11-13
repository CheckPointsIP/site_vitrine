/**
 * PLAN B CRM - Build Script
 * Minification et optimisation des assets pour production
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, '..'),
  distDir: path.join(__dirname, '..', 'dist'),
  files: {
    css: [
      { input: 'assets/css/styles.css', output: 'styles.min.css' }
    ],
    js: [
      { input: 'assets/js/script.js', output: 'script.min.js' },
      { input: 'assets/js/analytics-tracker.js', output: 'analytics-tracker.min.js' },
      { input: 'assets/js/admin-dashboard.js', output: 'admin-dashboard.min.js' }
    ]
  }
};

// Utilitaires
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

// Créer le dossier dist s'il n'existe pas
function ensureDistDir() {
  if (!fs.existsSync(CONFIG.distDir)) {
    fs.mkdirSync(CONFIG.distDir, { recursive: true });
    log.info('Dossier dist/ créé');
  }
}

// Minifier CSS
async function minifyCSS(inputFile, outputFile) {
  try {
    const inputPath = path.join(CONFIG.sourceDir, inputFile);
    const outputPath = path.join(CONFIG.distDir, outputFile);

    const input = fs.readFileSync(inputPath, 'utf8');
    const inputSize = Buffer.byteLength(input, 'utf8');

    const output = new CleanCSS({
      level: 2,
      format: false,
      compatibility: '*'
    }).minify(input);

    if (output.errors.length > 0) {
      throw new Error(output.errors.join('\n'));
    }

    fs.writeFileSync(outputPath, output.styles);

    const outputSize = Buffer.byteLength(output.styles, 'utf8');
    const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

    log.success(`CSS: ${inputFile} → ${outputFile}`);
    log.info(`  Taille: ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (-${reduction}%)`);

    return { inputSize, outputSize, reduction };
  } catch (error) {
    log.error(`Erreur lors de la minification de ${inputFile}: ${error.message}`);
    throw error;
  }
}

// Minifier JavaScript
async function minifyJS(inputFile, outputFile) {
  try {
    const inputPath = path.join(CONFIG.sourceDir, inputFile);
    const outputPath = path.join(CONFIG.distDir, outputFile);

    const input = fs.readFileSync(inputPath, 'utf8');
    const inputSize = Buffer.byteLength(input, 'utf8');

    const result = await minify(input, {
      compress: {
        dead_code: true,
        drop_console: false, // Garder console.log pour debug
        drop_debugger: true,
        keep_classnames: true,
        keep_fnames: false,
        passes: 2
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: false
      },
      format: {
        comments: false,
        preamble: `/* ${inputFile} - Minified by Terser */`
      },
      sourceMap: false
    });

    if (result.error) {
      throw result.error;
    }

    fs.writeFileSync(outputPath, result.code);

    const outputSize = Buffer.byteLength(result.code, 'utf8');
    const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

    log.success(`JS: ${inputFile} → ${outputFile}`);
    log.info(`  Taille: ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (-${reduction}%)`);

    return { inputSize, outputSize, reduction };
  } catch (error) {
    log.error(`Erreur lors de la minification de ${inputFile}: ${error.message}`);
    throw error;
  }
}

// Build principal
async function build() {
  console.log('\n🚀 Démarrage du build...\n');

  const startTime = Date.now();
  const stats = {
    css: { totalInput: 0, totalOutput: 0, count: 0 },
    js: { totalInput: 0, totalOutput: 0, count: 0 }
  };

  try {
    // Créer le dossier dist
    ensureDistDir();

    // Minifier les fichiers CSS
    log.info('\n📦 Minification CSS...');
    for (const file of CONFIG.files.css) {
      const result = await minifyCSS(file.input, file.output);
      stats.css.totalInput += result.inputSize;
      stats.css.totalOutput += result.outputSize;
      stats.css.count++;
    }

    // Minifier les fichiers JavaScript
    log.info('\n📦 Minification JavaScript...');
    for (const file of CONFIG.files.js) {
      const result = await minifyJS(file.input, file.output);
      stats.js.totalInput += result.inputSize;
      stats.js.totalOutput += result.outputSize;
      stats.js.count++;
    }

    // Statistiques finales
    const totalInput = stats.css.totalInput + stats.js.totalInput;
    const totalOutput = stats.css.totalOutput + stats.js.totalOutput;
    const totalReduction = ((1 - totalOutput / totalInput) * 100).toFixed(1);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(60));
    log.success('Build terminé avec succès !');
    console.log('='.repeat(60));
    console.log(`\n📊 Statistiques globales:`);
    console.log(`  CSS: ${stats.css.count} fichier(s) - ${formatBytes(stats.css.totalInput)} → ${formatBytes(stats.css.totalOutput)}`);
    console.log(`  JS: ${stats.js.count} fichier(s) - ${formatBytes(stats.js.totalInput)} → ${formatBytes(stats.js.totalOutput)}`);
    console.log(`  Total: ${formatBytes(totalInput)} → ${formatBytes(totalOutput)} (-${totalReduction}%)`);
    console.log(`  Économie: ${formatBytes(totalInput - totalOutput)}`);
    console.log(`  Durée: ${duration}s\n`);

    // Instructions
    console.log('📝 Prochaines étapes:');
    console.log('  1. Remplacez les imports dans vos fichiers HTML:');
    console.log('     <link rel="stylesheet" href="dist/styles.min.css">');
    console.log('     <script src="dist/script.min.js"></script>');
    console.log('  2. En production, utilisez: npm run start:prod\n');

  } catch (error) {
    log.error(`\nBuild échoué: ${error.message}`);
    process.exit(1);
  }
}

// Exécuter le build
if (require.main === module) {
  build();
}

module.exports = { build };
