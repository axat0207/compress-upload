require('dotenv').config();
const tinify = require('tinify');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configure Tinify API
tinify.key = process.env.TINIFY_API_KEY;

// Bunny CDN Configuration
const BUNNY_CONFIG = {
  hostname: process.env.BUNNY_STORAGE_HOSTNAME,
  storageZoneName: process.env.BUNNY_STORAGE_USERNAME,
  accessKey: process.env.BUNNY_STORAGE_PASSWORD,
  thumbnailFolder: 'thumbnail'
};

// Supported image extensions
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

/**
 * Get all image files from the public directory
 */
async function getImageFiles(publicDir) {
  try {
    const files = await fs.readdir(publicDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    });
    
    return imageFiles.map(file => path.join(publicDir, file));
  } catch (error) {
    console.error('Error reading public directory:', error.message);
    throw error;
  }
}

/**
 * Compress image using Tinify API
 */
async function compressImage(imagePath) {
  try {
    console.log(`Compressing: ${path.basename(imagePath)}...`);
    
    // Get original file size
    const originalStats = await fs.stat(imagePath);
    const originalSizeKB = (originalStats.size / 1024).toFixed(2);
    
    const source = tinify.fromFile(imagePath);
    const compressedBuffer = await source.toBuffer();
    
    // Get compressed file size
    const compressedSizeKB = (compressedBuffer.length / 1024).toFixed(2);
    const compressionRatio = ((1 - compressedBuffer.length / originalStats.size) * 100).toFixed(1);
    
    console.log(`✓ Compressed: ${path.basename(imagePath)}`);
    console.log(`  Original size: ${originalSizeKB} KB`);
    console.log(`  Compressed size: ${compressedSizeKB} KB`);
    console.log(`  Compression ratio: ${compressionRatio}% smaller`);
    
    return compressedBuffer;
  } catch (error) {
    console.error(`Error compressing ${path.basename(imagePath)}:`, error.message);
    throw error;
  }
}

/**
 * Upload compressed image to Bunny CDN
 */
async function uploadToBunnyCDN(buffer, filename) {
  try {
    const uploadUrl = `https://${BUNNY_CONFIG.hostname}/${BUNNY_CONFIG.storageZoneName}/${BUNNY_CONFIG.thumbnailFolder}/${filename}`;
    
    console.log(`Uploading to Bunny CDN: ${filename}...`);
    
    const response = await axios.put(uploadUrl, buffer, {
      headers: {
        'AccessKey': BUNNY_CONFIG.accessKey,
        'Content-Type': 'application/octet-stream',
        'accept': 'application/json'
      }
    });
    
    if (response.status === 201) {
      console.log(`✓ Uploaded successfully: ${filename}`);
      const publicUrl = `https://${process.env.BUNNY_PULL_ZONE_HOSTNAME}.b-cdn.net/${BUNNY_CONFIG.thumbnailFolder}/${filename}`;
      return publicUrl;
    } else {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

/**
 * Process a single image: compress and upload
 */
async function processImage(imagePath) {
  const filename = path.basename(imagePath);
  
  try {
    // Compress the image
    const compressedBuffer = await compressImage(imagePath);
    
    // Upload to Bunny CDN
    const publicUrl = await uploadToBunnyCDN(compressedBuffer, filename);
    
    return {
      success: true,
      filename,
      url: publicUrl
    };
  } catch (error) {
    return {
      success: false,
      filename,
      error: error.message
    };
  }
}

/**
 * Main function to process all images
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Image Compression & Upload to Bunny CDN');
  console.log('='.repeat(60));
  console.log('');
  
  const publicDir = path.join(__dirname, 'public');
  
  // Check if public directory exists
  try {
    await fs.access(publicDir);
  } catch (error) {
    console.error(`Error: Public directory not found at ${publicDir}`);
    console.error('Please create a "public" folder and add your images there.');
    process.exit(1);
  }
  
  // Get all image files
  const imageFiles = await getImageFiles(publicDir);
  
  if (imageFiles.length === 0) {
    console.log('No images found in the public directory.');
    console.log(`Please add images (${SUPPORTED_EXTENSIONS.join(', ')}) to the public folder.`);
    process.exit(0);
  }
  
  console.log(`Found ${imageFiles.length} image(s) to process:\n`);
  imageFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${path.basename(file)}`);
  });
  console.log('');
  
  // Process all images
  const results = [];
  for (const imagePath of imageFiles) {
    console.log('-'.repeat(60));
    const result = await processImage(imagePath);
    results.push(result);
    console.log('');
  }
  
  // Display summary
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log('');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✓ Successfully processed: ${successful.length} image(s)`);
  if (successful.length > 0) {
    console.log('\nPublic URLs:');
    successful.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.filename}`);
      console.log(`     ${result.url}`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length} image(s)`);
    failed.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.filename}: ${result.error}`);
    });
  }
  
  console.log('');
  console.log(`Tinify API compression count this month: ${tinify.compressionCount || 'N/A'}`);
  console.log('');
}

// Run the main function
main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});

