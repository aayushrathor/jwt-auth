const express = require("express");
const sharp = require("sharp");
const multer = require("multer");
const path = require("path");

const app = express();

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: fileStorageEngine });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/imgthumbnail.html'));
});

app.post('/textify', upload.single("image"), (req, res) => {
    console.log(req.file);
    res.send("Image uploaded successfully.");
});

async function getImage() {
    try {
        const imgMetaData = await sharp("inputImage.png").metadata();
        console.log(imgMetaData);
    } catch (error) {
        console.error(error);
    }
}

async function addTextOnImage() {
    try {
        const width = 750;
        const height = 483;
        const text = "Image Thumbnail Added"

        const svgImage = `
        <svg width="${width}" height="${height}">
          <style>
          .title { fill: #FFF; font-size: 70px; font-weight: bold;}
          </style>
          <text x="50%" y="50%" text-anchor="middle" class="title">${text}</text>
        </svg>
        `;
        
        const svgBuffer = Buffer.from(svgImage);
        const image = await sharp("inputImage.png")
            .composite([
                {
                    input: svgBuffer,
                    top: 25,
                    left: 25,
                },
            ])
            .toFile('outputImage.png');

            console.log("Successfully added text....");
    } catch (error) {
        console.log(error);
    }
}

getImage();
addTextOnImage();

const PORT = 4000;
app.listen(PORT, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Server running on https://localhost:${PORT}`);
    }
});