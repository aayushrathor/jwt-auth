const express = require("express");
const sharp = require("sharp");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const client = require("https");

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

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
}

async function resize() {
    sharp('inputImage.png')
        .resize(50, 50)
        .toFile('outputImage.png')
        .then(data => {
            console.log("success", data)
        })
        .catch(err => {
            console.log(err)
        });
}

async function addTextOnImage() {
    try {
        const width = 50;
        const height = 50;
        const text = "Image Thumbnail Added"

        const svgImage = `
            <svg width="${width}" height="${height}">
            <style>
            .title { fill: #FFF; font-size: 20px; font-weight: bold;}
            </style>
            <text x="50%" y="50%" text-anchor="middle" class="title">${text}</text>
            </svg>
            `;

        const svgBuffer = Buffer.from(svgImage);
        const image = await sharp("inputImage.png")
            .composite([
                {
                    input: svgBuffer,
                    top: 0,
                    left: 0,
                },
            ])
            .toFile('finalImage.png');

        console.log("Successfully added text....");
    } catch (error) {
        console.log(error);
    }
}

downloadImage('https://raw.githubusercontent.com/aayushrathor/dotfiles/main/showcase.png', 'inputImage.png');
resize();
// addTextOnImage();

const PORT = 4000;
app.listen(PORT, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Server running on https://localhost:${PORT}`);
    }
});