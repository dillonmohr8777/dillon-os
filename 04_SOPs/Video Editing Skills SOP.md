# Video Editing Skills SOP

Three skills are installed in `~/.claude/skills/` so any Claude Code session can edit video without re-teaching it.

## Skills

### 1. `video-edit` — one-shot FFmpeg ops
Fastest way to: trim, concat, convert format, resize, crop to vertical, burn/mux subtitles, extract audio, speed up/slow down, add watermark, make GIFs, grab thumbnails, normalize loudness.

Use when the request is a single transformation on one or a few clips.

### 2. `video-use` — conversational long-form editor
Transcript-driven editing for talking heads, interviews, montages, tutorials, travel videos. Probes sources with ffprobe, transcribes via ElevenLabs Scribe, proposes a strategy, then cuts/grades/captions.

Requires `ELEVENLABS_API_KEY` in `.env` and `ffmpeg` on PATH. First run installs Python deps.

### 3. `manim-video` — generative animations
3Blue1Brown-style mathematical/technical animations: algorithm walkthroughs, equation derivations, architecture diagrams. Draft with `-ql`, production with `-qh`.

Requires Manim Community Edition + LaTeX + ffmpeg.

## How to invoke

Just describe what you want in plain English. Claude auto-selects:

- "Cut 10s–45s out of demo.mp4 and make it vertical" → `video-edit`
- "Edit this interview down to the best 2 minutes" → `video-use`
- "Animate how binary search works" → `manim-video`

Or force a skill by typing `/video-edit`, `/video-use`, `/manim-video`.

## Where the skills live

```
~/.claude/skills/
├── video-edit/       SKILL.md only (FFmpeg recipes)
├── video-use/        full browser-use/video-use repo
└── manim-video/      standalone copy of the manim sub-skill
```

Skills at `~/.claude/` are available across every project. Put project-specific skills in `<project>/.claude/skills/` instead.

## Updating

```bash
cd /tmp && git clone --depth 1 https://github.com/browser-use/video-use.git
rm -rf ~/.claude/skills/video-use ~/.claude/skills/manim-video
cp -r /tmp/video-use ~/.claude/skills/video-use
cp -r /tmp/video-use/skills/manim-video ~/.claude/skills/manim-video
rm -rf ~/.claude/skills/*/\.git
```
