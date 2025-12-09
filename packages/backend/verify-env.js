/**
 * Environment Variables Verification Script
 * Run this to check if your environment is properly configured
 * 
 * Usage: node verify-env.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile(filename) {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    log(`✗ ${filename} not found`, 'red');
    return false;
  }
  
  log(`✓ ${filename} exists`, 'green');
  return true;
}

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function validateEnvVars(env, envName) {
  log(`\n📋 Validating ${envName} environment variables:`, 'cyan');
  
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'NODE_ENV',
    'PORT',
  ];
  
  const optional = [
    'FRONTEND_URL_DEV',
    'FRONTEND_URL_PROD',
    'DEBUG',
    'LOG_LEVEL',
  ];
  
  let allValid = true;
  
  // Check required variables
  required.forEach(key => {
    if (!env[key] || env[key].includes('your-') || env[key].includes('xxxxx')) {
      log(`  ✗ ${key}: Missing or contains placeholder`, 'red');
      allValid = false;
    } else if (key === 'JWT_SECRET' || key === 'JWT_REFRESH_SECRET') {
      if (env[key].length < 32) {
        log(`  ✗ ${key}: Too short (minimum 32 characters)`, 'red');
        allValid = false;
      } else {
        log(`  ✓ ${key}: Configured (${env[key].length} chars)`, 'green');
      }
    } else if (key === 'MONGO_URI') {
      if (env[key].startsWith('mongodb://') || env[key].startsWith('mongodb+srv://')) {
        log(`  ✓ ${key}: Valid format`, 'green');
      } else {
        log(`  ✗ ${key}: Invalid format`, 'red');
        allValid = false;
      }
    } else {
      log(`  ✓ ${key}: ${env[key]}`, 'green');
    }
  });
  
  // Check optional variables
  optional.forEach(key => {
    if (env[key] && env[key].trim() !== '') {
      log(`  ℹ ${key}: ${env[key]}`, 'blue');
    }
  });
  
  return allValid;
}

function checkJWTSecretsDifferent() {
  log('\n🔐 Checking JWT secrets are different between environments:', 'cyan');
  
  const dev = loadEnvFile('.env.development');
  const prod = loadEnvFile('.env.production');
  
  if (!dev || !prod) {
    log('  ⚠ Cannot compare - one or both env files missing', 'yellow');
    return;
  }
  
  if (dev.JWT_SECRET === prod.JWT_SECRET) {
    log('  ✗ JWT_SECRET is the SAME in dev and prod (SECURITY RISK!)', 'red');
    return false;
  } else {
    log('  ✓ JWT_SECRET is different between dev and prod', 'green');
  }
  
  if (dev.JWT_REFRESH_SECRET === prod.JWT_REFRESH_SECRET) {
    log('  ✗ JWT_REFRESH_SECRET is the SAME in dev and prod (SECURITY RISK!)', 'red');
    return false;
  } else {
    log('  ✓ JWT_REFRESH_SECRET is different between dev and prod', 'green');
  }
  
  return true;
}

function main() {
  log('\n╔════════════════════════════════════════════╗', 'cyan');
  log('║   Backend Environment Verification Tool   ║', 'cyan');
  log('╚════════════════════════════════════════════╝\n', 'cyan');
  
  // Check if files exist
  log('📁 Checking environment files:', 'cyan');
  const hasExample = checkEnvFile('.env.example');
  const hasDev = checkEnvFile('.env.development');
  const hasProd = checkEnvFile('.env.production');
  
  if (!hasExample || !hasDev || !hasProd) {
    log('\n❌ Some environment files are missing!', 'red');
    log('Run: npm run setup:env (if available) or create them manually', 'yellow');
    process.exit(1);
  }
  
  // Validate development environment
  const devEnv = loadEnvFile('.env.development');
  const devValid = validateEnvVars(devEnv, 'Development');
  
  // Validate production environment
  const prodEnv = loadEnvFile('.env.production');
  const prodValid = validateEnvVars(prodEnv, 'Production');
  
  // Check JWT secrets are different
  const secretsValid = checkJWTSecretsDifferent();
  
  // Summary
  log('\n' + '═'.repeat(50), 'cyan');
  log('📊 SUMMARY:', 'cyan');
  log('═'.repeat(50), 'cyan');
  
  if (devValid && prodValid && secretsValid) {
    log('\n✅ All environment variables are properly configured!', 'green');
    log('You can now run the application.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some environment variables need attention:', 'yellow');
    if (!devValid) log('  - Fix development environment variables', 'yellow');
    if (!prodValid) log('  - Fix production environment variables', 'yellow');
    if (!secretsValid) log('  - Use different JWT secrets for dev and prod', 'yellow');
    log('\nRefer to ENV_SETUP_GUIDE.md for detailed instructions.', 'blue');
    process.exit(1);
  }
}

main();

