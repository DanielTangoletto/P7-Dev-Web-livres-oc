const sharp = require("sharp");
const path = require('path');
const fs = require('fs');

sharp.cache(false);

const updateImage = (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        } else {
            const name = path.parse(req.file.originalname).name;
            sharp(req.file.path)
                .resize({
                    width: 360,
                    height: 570
                })
                .webp({ quality: 80 })
                .toFile('images/' + name + ".webp")
                .then(() => fs.unlink(req.file.path, (e) => console.log(e)));
            next();
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = updateImage;