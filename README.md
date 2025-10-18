# Image Compression & Upload to Bunny CDN

This Node.js application automatically compresses images using the Tinify API and uploads them to Bunny CDN in a thumbnail folder.

## Features

- 🖼️ Compresses images using Tinify API (TinyPNG/TinyJPG)
- ☁️ Uploads compressed images to Bunny CDN storage
- 📁 Organizes uploads in a `thumbnail` folder
- 🎯 Supports multiple image formats: JPEG, PNG, WebP, AVIF
- 📊 Provides detailed progress and summary reports
- ✅ Error handling for failed compressions/uploads

## Prerequisites

- Node.js (v14 or higher)
- Bunny CDN account with storage zone
- Tinify API key (from TinyPNG)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `env.example` to `.env` (if not already created)
   - Update the credentials in `.env` if needed

## Environment Variables

The following environment variables are required:

```env
# Bunny CDN Credentials
BUNNY_STORAGE_USERNAME=snaptv
BUNNY_STORAGE_PASSWORD=your-bunny-storage-password
BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com
BUNNY_STORAGE_ZONE_NAME=snaptv
BUNNY_PULL_ZONE_HOSTNAME=vz-00ba8487-482

# Tinify API Key
TINIFY_API_KEY=your-tinify-api-key
```

## Usage

1. Place your images in the `public` folder

2. Run the compression and upload script:
```bash
npm start
```

Or:
```bash
node index.js
```

3. The script will:
   - Find all images in the `public` folder
   - Compress each image using Tinify
   - Upload compressed images to Bunny CDN in the `thumbnail` folder
   - Display a summary with public URLs

## Supported Image Formats

- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)
- AVIF (`.avif`)

## Output

After processing, you'll receive:

- Progress updates for each image
- Public CDN URLs for uploaded images
- Summary of successful and failed uploads
- Tinify API compression count

### Example Output:

```
============================================================
Image Compression & Upload to Bunny CDN
============================================================

Found 3 image(s) to process:

  1. image1.jpg
  2. image2.png
  3. image3.webp

------------------------------------------------------------
Compressing: image1.jpg...
✓ Compressed: image1.jpg
Uploading to Bunny CDN: image1.jpg...
✓ Uploaded successfully: image1.jpg

------------------------------------------------------------
Summary
------------------------------------------------------------

✓ Successfully processed: 3 image(s)

Public URLs:
  1. image1.jpg
     https://vz-00ba8487-482.b-cdn.net/thumbnail/image1.jpg
  2. image2.png
     https://vz-00ba8487-482.b-cdn.net/thumbnail/image2.png
  3. image3.webp
     https://vz-00ba8487-482.b-cdn.net/thumbnail/image3.webp

Tinify API compression count this month: 3
```

## API Documentation

### Tinify API

- **Endpoint**: `https://api.tinify.com`
- **Authentication**: Basic Auth with API key
- **Documentation**: https://tinypng.com/developers

### Bunny CDN Storage API

- **Endpoint**: `https://storage.bunnycdn.com`
- **Method**: PUT
- **Authentication**: AccessKey header
- **Documentation**: https://docs.bunny.net/reference/storage-api

## File Structure

```
compression_upload/
├── index.js           # Main application script
├── package.json       # Node.js dependencies
├── env.example        # Environment variables template
├── .gitignore        # Git ignore rules
├── README.md         # This file
└── public/           # Place your images here
    └── .gitkeep
```

## Error Handling

The application handles various error scenarios:

- Missing public directory
- No images found
- Compression failures
- Upload failures
- Invalid credentials

Each error is logged with details to help troubleshoot issues.

## Limitations

- **Tinify API**: Free tier allows 500 compressions per month
- **File Size**: Maximum file size depends on your Bunny CDN plan
- **Concurrent Uploads**: Images are processed sequentially to avoid rate limiting

## Troubleshooting

### "Unauthorized" Error
- Verify your Tinify API key is correct
- Check your Bunny CDN credentials

### "Storage zone not found"
- Ensure `BUNNY_STORAGE_USERNAME` matches your storage zone name
- Verify the storage zone exists in your Bunny CDN account

### No images found
- Check that images are placed directly in the `public` folder
- Ensure images have supported extensions

## License

ISC

## Support

For issues or questions:
- Tinify API: support@tinify.com
- Bunny CDN: https://support.bunny.net

# compress-upload
