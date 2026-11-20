# deeppower-tech.com

Static company site for DeepPower Technology, hosted on GitHub Pages. No build step: edit, push to `main`, and GitHub redeploys in about a minute.

## Structure

```
index.html               home
capabilities/index.html  /capabilities/
markets/index.html       /markets/
firm/index.html          /firm/
contact/index.html       /contact/
404.html                 not-found page
assets/site.css          shared styles (tokens, layout, page transitions)
assets/site.js           shared behavior (flow field, page transitions)
```

The header and footer are repeated in each page; change them in every file.

## Local preview

```
python -m http.server 8080
```

Then open http://localhost:8080.
