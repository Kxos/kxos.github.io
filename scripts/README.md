# CV

`gen_cv.py` genera il CV in HTML (EN e IT); il PDF si ottiene stampandolo con Chrome headless:

```sh
python scripts/gen_cv.py out
chrome --headless=new --no-pdf-header-footer --print-to-pdf=public/cv/Vito_Iannone_CV_EN.pdf out/cv-en.html
chrome --headless=new --no-pdf-header-footer --print-to-pdf=public/cv/Vito_Iannone_CV_IT.pdf out/cv-it.html
```

Il CV non contiene indirizzo, telefono, data di nascita né foto.
