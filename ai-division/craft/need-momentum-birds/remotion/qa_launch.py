"""Verify the delivered master and extract review frames from that exact MP4."""
import hashlib
import json
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
OUT = ROOT / 'out'
VIDEO = OUT / 'NeedMomentumAILaunch30-review.mp4'
FRAMES = OUT / 'launch-qa'
FRAMES.mkdir(exist_ok=True)
data = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(VIDEO)]))
video = next(s for s in data['streams'] if s['codec_type'] == 'video')
audio = next(s for s in data['streams'] if s['codec_type'] == 'audio')
assert (video['width'], video['height'], video['r_frame_rate'], int(video['nb_frames'])) == (1920, 1080, '30/1', 900)
assert abs(float(data['format']['duration']) - 30) < .05
assert audio['channels'] == 2 and int(audio['sample_rate']) == 48000
main = [75, 240, 375, 555, 675, 840]
transitions = [0,108,119,120,131,132,258,269,270,290,320,332,350,408,419,420,448,582,599,600,620,738,749,750,768,779,780,899]
frames = sorted(set(main + transitions))
selection = '+'.join(f'eq(n\\,{f})' for f in frames)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(VIDEO), '-vf', f'select={selection}', '-fps_mode', 'vfr', str(FRAMES / 'sample-%03d.png')], check=True)
images = dict(zip(frames, sorted(FRAMES.glob('sample-*.png'))))
font = ImageFont.truetype(str(ROOT/'public/fonts/NunitoSans.ttf'), 20)
def sheet(chosen, columns, width, name):
    height = round(width * 1080 / 1920)
    rows = (len(chosen) + columns - 1) // columns
    canvas = Image.new('RGB', (columns * width, rows * (height + 34)), '#072d53')
    draw = ImageDraw.Draw(canvas)
    for i, frame in enumerate(chosen):
        x, y = (i % columns) * width, (i // columns) * (height + 34)
        with Image.open(images[frame]) as im:
            canvas.paste(im.resize((width, height), Image.Resampling.LANCZOS), (x, y))
        draw.text((x + 12, y + height + 5), f'{frame/30:05.2f}s  |  frame {frame}', fill='#FBF8F4', font=font)
    canvas.save(OUT / name)
sheet(main, 3, 640, 'NeedMomentumAILaunch30-contact-sheet.jpg')
sheet(transitions, 4, 480, 'NeedMomentumAILaunch30-transitions.jpg')
data['sha256'] = hashlib.sha256(VIDEO.read_bytes()).hexdigest()
data['qa_frames'] = frames
data['status'] = 'local-review-export-technical-checks-passed'
data['audio_source'] = 'Original local synthesis: paper, pencil, quiet plucked pulse. No voiceover.'
(OUT/'NeedMomentumAILaunch30-ffprobe.json').write_text(json.dumps(data, indent=2), encoding='utf-8')
print(json.dumps({'duration': data['format']['duration'], 'frames': video['nb_frames'], 'dimensions': [video['width'],video['height']], 'audio': audio['codec_name'], 'sha256': data['sha256'], 'sampled_frames': len(frames)}, indent=2))
