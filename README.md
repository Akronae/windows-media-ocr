# windows-media-ocr
> 🔎 OCR lib for Windows & WSL that outputs structured data with bounding rects

![image](https://github.com/user-attachments/assets/5afa4ad5-185f-4bd0-8751-515e90496c88)

This library is a wrapper around [akronae/windows_media_ocr_cli](https://github.com/Akronae/windows_media_ocr_cli)

## How to install
```bash
yarn add windows-media-ocr
```
```bash
npm i windows-media-ocr
```

## How to use

```ts
import { ocr } from "windows-media-ocr";

const res = await ocr("image.png");
console.log(res.Text, "has", res.Lines.length, "lines");
```
