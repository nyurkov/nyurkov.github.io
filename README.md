# Personal Website

Static personal website ready for GitHub Pages deployment.

## Included

- Single-page editorial design
- Title font set to `"Instrument Serif", "Instrument Serif Fallback"`
- Resume CTA linked to `assets/resume/Nikita_Yurkov_Resume.pdf`
- Company logos for Wickr, Samsara, Block, Dropbox
- Hidden S&P 500 7-year chart revealed by Konami code

## Local Preview

Run a local static server from this directory, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages (User Site)

1. Create or use repository named `<your-username>.github.io`.
2. Put these files at the repository root.
3. Push to `main` branch.
4. In GitHub: `Settings -> Pages`.
5. Set source to `Deploy from a branch`, branch `main`, folder `/ (root)`.
6. Save. Site will publish at `https://<your-username>.github.io/`.

## Customize Quickly

- Update social links in `index.html` footer.
- Replace bio/project copy in `index.html`.
- Replace resume file at `assets/resume/Nikita_Yurkov_Resume.pdf`.
- If needed, swap logo image files in `assets/logos/`.
