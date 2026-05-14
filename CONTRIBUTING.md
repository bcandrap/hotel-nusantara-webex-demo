# Contributing

Thanks for your interest in improving this demo! Contributions, ideas, and bug reports are welcome.

## How to contribute

### Reporting bugs

Open an issue with:

- **What you did** (steps to reproduce)
- **What you expected** to happen
- **What actually happened** (error messages, screenshots)
- **Browser & OS** (Chrome 132 on macOS, etc.)
- **Webex SDK version** in your `index.html`
- **Relevant logs** from browser Console and Netlify Function logs

### Suggesting features

Open an issue describing:

- The use case (e.g., "demo for retail customer")
- Why the current design doesn't cover it
- A rough sketch of how it could work

### Pull requests

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-thing`
3. Make changes — keep them focused (one PR = one change)
4. Test the deploy works end-to-end (call connects, audio works, hang up works)
5. Update README/docs if you changed behavior
6. Open PR with description of what + why

## Code style

- No build step on purpose — keep it that way unless you have a strong reason
- React via Babel Standalone (no Webpack/Vite)
- All UI text goes in `copy.js` as `{ id, en }` pairs (Indonesian + English)
- CSS uses OKLCH colors via custom properties — don't hardcode hex values
- Defensive coding for SDK calls (try multiple method names) — Click-to-Call is beta

## Testing changes

Before submitting PR:

- [ ] Deploy your fork to a separate Netlify site
- [ ] Confirm the SDK status badge shows green
- [ ] Make a real Click-to-Call to your Auto Attendant
- [ ] Verify audio works both directions
- [ ] Test hang up button
- [ ] Test on mobile browser (Safari iOS, Chrome Android)
- [ ] Verify language toggle still works for any new copy keys

## What we won't merge

- PRs that add a heavy build step (Webpack, Vite, etc.) without strong justification
- PRs that hardcode brand-specific strings outside `copy.js`
- PRs that move secrets to the frontend (this defeats the whole architecture)
- PRs that remove the defensive coding patterns (they exist for SDK version resilience)
- PRs without testing the actual call flow end-to-end

## Questions

Open an issue with the `question` label, or contact the maintainer.
