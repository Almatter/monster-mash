"""Pack generated master/regions into streaming tiles. No synthetic scenery is drawn."""
import argparse,base64,json
from pathlib import Path
from PIL import Image,ImageDraw

parser=argparse.ArgumentParser()
parser.add_argument('--generated',type=Path)
parser.add_argument('--hag',type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
source=root/'art-source/crucible';output=root/'public/assets/crucible'
(source/'sectors').mkdir(parents=True,exist_ok=True)
(output/'tiles').mkdir(parents=True,exist_ok=True)
if args.generated:
    Image.open(root/'output/imagegen/crucible/master.png').convert('RGB').save(source/'master.webp',lossless=True)
    for entry in json.loads(args.generated.read_text(encoding='utf-8')):
        Image.open(entry['path']).convert('RGB').save(source/f"sectors/{entry['x']}-{entry['y']}.webp",lossless=True)
if args.hag:
    Image.open(args.hag).convert('RGBA').resize((384,384),Image.Resampling.LANCZOS).save(output/'relic-hag.webp',lossless=True)
master=Image.open(source/'master.webp').convert('RGB').resize((5120,5120),Image.Resampling.LANCZOS)
mask=Image.new('L',(1280,1280));draw=ImageDraw.Draw(mask)
for n in range(80):draw.rectangle((n,n,1279-n,1279-n),fill=round(n/79*255))
for y in range(4):
    for x in range(4):
        region=Image.open(source/f'sectors/{x}-{y}.webp').convert('RGB').resize((1280,1280),Image.Resampling.LANCZOS)
        # Shared master boundaries prevent seams without stretching its interiors.
        master.paste(region,(x*1280,y*1280),mask)
master.save(source/'assembled.png')
master.resize((1200,1200),Image.Resampling.LANCZOS).save(output/'overview.webp',quality=93,method=6)
for y in range(5):
    for x in range(5):
        padded=Image.new('RGB',(1028,1028))
        crop=master.crop((x*1024,y*1024,(x+1)*1024,(y+1)*1024));padded.paste(crop,(2,2))
        padded.paste(crop.crop((0,0,1024,1)).resize((1024,2)),(2,0));padded.paste(crop.crop((0,1023,1024,1024)).resize((1024,2)),(2,1026))
        padded.paste(padded.crop((2,0,3,1028)).resize((2,1028)),(0,0));padded.paste(padded.crop((1025,0,1026,1028)).resize((2,1028)),(1026,0))
        padded.save(output/f'tiles/{x}-{y}.webp',quality=91,method=6)
doc=json.loads((source/'layout.json').read_text(encoding='utf-8'))
doc['background']['dataUrl']='data:image/webp;base64,'+base64.b64encode((output/'overview.webp').read_bytes()).decode()
(output/'map-document.json').write_text(json.dumps(doc,separators=(',',':')),encoding='utf-8')
print('Packed 25 streaming tiles, overview, and editor document.')
