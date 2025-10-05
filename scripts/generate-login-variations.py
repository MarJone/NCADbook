import json
import urllib.request
import urllib.parse
import random
import time
import os

# ComfyUI server address
SERVER_ADDRESS = "127.0.0.1:8188"
CLIENT_ID = str(random.randint(1000000, 9999999))

def queue_prompt(prompt):
    """Send prompt to ComfyUI"""
    p = {"prompt": prompt, "client_id": CLIENT_ID}
    data = json.dumps(p).encode('utf-8')
    req = urllib.request.Request(f"http://{SERVER_ADDRESS}/prompt", data=data, headers={'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req).read())

def get_image(filename, subfolder, folder_type):
    """Download generated image from ComfyUI"""
    data = {"filename": filename, "subfolder": subfolder, "type": folder_type}
    url_values = urllib.parse.urlencode(data)
    with urllib.request.urlopen(f"http://{SERVER_ADDRESS}/view?{url_values}") as response:
        return response.read()

def get_history(prompt_id):
    """Get generation history"""
    with urllib.request.urlopen(f"http://{SERVER_ADDRESS}/history/{prompt_id}") as response:
        return json.loads(response.read())

def generate_image(prompt_text, seed, output_filename):
    """Generate a single image with given prompt and seed"""
    workflow = {
        "3": {
            "inputs": {
                "seed": seed,
                "steps": 25,
                "cfg": 7.5,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1,
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0]
            },
            "class_type": "KSampler"
        },
        "4": {
            "inputs": {
                "ckpt_name": "juggernautXL_ragnarokBy.safetensors"
            },
            "class_type": "CheckpointLoaderSimple"
        },
        "5": {
            "inputs": {
                "width": 1024,
                "height": 1024,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage"
        },
        "6": {
            "inputs": {
                "text": prompt_text,
                "clip": ["4", 1]
            },
            "class_type": "CLIPTextEncode"
        },
        "7": {
            "inputs": {
                "text": "photo, photograph, realistic, 3d render, CGI, digital art, blurry, messy, unclear, colored, chromatic, rainbow, watercolor, oil painting, acrylic, soft focus, low quality, amateur",
                "clip": ["4", 1]
            },
            "class_type": "CLIPTextEncode"
        },
        "8": {
            "inputs": {
                "samples": ["3", 0],
                "vae": ["4", 2]
            },
            "class_type": "VAEDecode"
        },
        "9": {
            "inputs": {
                "filename_prefix": "ncadbook_batch",
                "images": ["8", 0]
            },
            "class_type": "SaveImage"
        }
    }

    try:
        prompt_response = queue_prompt(workflow)
        prompt_id = prompt_response['prompt_id']
        print(f"  Queued (ID: {prompt_id[:8]}...) - ", end="", flush=True)

        # Wait for completion
        while True:
            history = get_history(prompt_id)
            if prompt_id in history:
                break
            time.sleep(2)
            print(".", end="", flush=True)

        # Get the generated image
        output_data = history[prompt_id]['outputs']
        for node_id in output_data:
            if 'images' in output_data[node_id]:
                for image_data in output_data[node_id]['images']:
                    image_bytes = get_image(
                        image_data['filename'],
                        image_data['subfolder'],
                        image_data['type']
                    )

                    # Save to public folder
                    output_path = f"c:\\Users\\jones\\AIprojects\\NCADbook\\public\\{output_filename}"
                    with open(output_path, 'wb') as f:
                        f.write(image_bytes)

                    file_size = len(image_bytes) / 1024
                    print(f" DONE ({file_size:.1f} KB)")
                    return True

        return False

    except Exception as e:
        print(f" ERROR: {e}")
        return False

# Main prompt for full map
MAIN_PROMPT = """Architectural illustration of National College of Art and Design Dublin divided into four distinct quadrants, pen and ink sketch style, cross-hatching technique, isometric library layout showing Thomas Street campus buildings, top left quadrant: student portal entrance with study spaces easels sketchbooks collaborative areas, top right quadrant: staff portal with faculty offices meeting rooms resource centers, bottom left quadrant: department head portal with administrative offices conference rooms leadership spaces, bottom right quadrant: main admin portal with reception desk bureaucratic spaces filing systems, Georgian architecture details, art studios and workshops, design department spaces, vintage educational materials, Irish art history elements, 1746 founding heritage, pottery wheels and easels, printmaking presses, scattered art supplies, hand-drawn linework, loose gestural sketching, dramatic contrast, black ink on white paper, architectural blueprint aesthetic, mixed with elegant fashion illustration details, flowing fabric textures, expressive mark-making, artistic workspace atmosphere, cultural institution mapping, educational journey visualization, "NCAD" text integration, clear quadrant divisions, portal gateway aesthetics, birds flying overhead, potted plants, reading nooks, exhibition spaces, creative learning environments, monochromatic palette, detailed crosshatch shading, organic line variation, architectural storytelling, Irish design education legacy, four-section composition, interactive navigation layout"""

# Hover state prompts - zoomed in with highlighted detail
HOVER_PROMPTS = {
    "student": """Zoomed in architectural pen and ink illustration focusing on NCAD student portal area, detailed cross-hatching, isometric view of student study spaces with easels and sketchbooks, collaborative workspace with art students drawing, vintage wooden desks covered in sketches and charcoal, pottery wheels and clay sculptures, fashion design mannequins, loose gestural pen strokes, dramatic ink wash highlights, scattered pencils and brushes, large arched Georgian windows, potted plants, inspirational art posters, birds perched on window sills, flowing fabric draping, expressive mark-making, enhanced detail and contrast, glowing emphasis effect, black ink on white paper with subtle grey wash accents, artistic energy and creativity, intimate workspace view, student life atmosphere, monochromatic with dramatic lighting""",

    "staff": """Zoomed in architectural pen and ink illustration focusing on NCAD staff portal area, detailed cross-hatching, isometric view of faculty offices and meeting rooms, resource center with art history books and portfolios, professor's desk with grading materials, critique wall with student work pinned up, vintage filing cabinets, elegant furniture, tea service on side table, large windows overlooking courtyard, academic regalia hanging, Irish art reference materials, loose gestural pen strokes, dramatic ink wash highlights, sophisticated atmosphere, enhanced detail and contrast, glowing emphasis effect, black ink on white paper with subtle grey wash accents, professional academic environment, collaborative teaching spaces, monochromatic with warm lighting""",

    "admin": """Zoomed in architectural pen and ink illustration focusing on NCAD department head portal area, detailed cross-hatching, isometric view of administrative offices and conference rooms, leadership spaces with strategic planning boards, vintage wooden filing systems, organized desk with approval stamps and documents, framed certificates and awards on walls, elegant meeting table with chairs, potted ferns, Georgian architectural details, brass fixtures, loose gestural pen strokes, dramatic ink wash highlights, authoritative atmosphere, enhanced detail and contrast, glowing emphasis effect, black ink on white paper with subtle grey wash accents, executive office environment, institutional heritage, monochromatic with sophisticated lighting""",

    "master": """Zoomed in architectural pen and ink illustration focusing on NCAD main admin portal area, detailed cross-hatching, isometric view of grand reception desk and bureaucratic command center, institutional filing systems and archives, vintage switchboard and communication equipment, welcome area with NCAD crest and founding date 1746, elegant Victorian furniture, ornate Irish architectural details, administrative staff workspace, visitor seating, information boards, brass plaques, loose gestural pen strokes, dramatic ink wash highlights, institutional grandeur, enhanced detail and contrast, glowing emphasis effect, black ink on white paper with subtle grey wash accents, official administrative atmosphere, heritage and tradition, monochromatic with regal lighting"""
}

# Random seeds for 4 variations
SEEDS = [
    random.randint(1, 1000000000),
    random.randint(1, 1000000000),
    random.randint(1, 1000000000),
    random.randint(1, 1000000000)
]

print("=" * 70)
print("NCAD LOGIN MAP - BATCH GENERATION")
print("=" * 70)
print(f"Generating 4 main map variations + 4 hover states each = 20 images total")
print(f"Seeds: {[str(s)[:6] for s in SEEDS]}")
print("=" * 70)

total_generated = 0
failed = 0

# Generate 4 variations of main map
print("\n[MAIN MAPS - 4 Variations]")
for i, seed in enumerate(SEEDS, 1):
    print(f"\nVariation {i} (seed: {seed}):")
    if generate_image(MAIN_PROMPT, seed, f"login-map-v{i}.png"):
        total_generated += 1
    else:
        failed += 1

# Generate hover states for each variation
for i, seed in enumerate(SEEDS, 1):
    print(f"\n[HOVER STATES - Variation {i}]")

    # Student hover
    print(f"  Student quadrant: ", end="", flush=True)
    if generate_image(HOVER_PROMPTS["student"], seed + 1, f"login-map-v{i}-hover-student.png"):
        total_generated += 1
    else:
        failed += 1

    # Staff hover
    print(f"  Staff quadrant: ", end="", flush=True)
    if generate_image(HOVER_PROMPTS["staff"], seed + 2, f"login-map-v{i}-hover-staff.png"):
        total_generated += 1
    else:
        failed += 1

    # Admin hover
    print(f"  Admin quadrant: ", end="", flush=True)
    if generate_image(HOVER_PROMPTS["admin"], seed + 3, f"login-map-v{i}-hover-admin.png"):
        total_generated += 1
    else:
        failed += 1

    # Master hover
    print(f"  Master quadrant: ", end="", flush=True)
    if generate_image(HOVER_PROMPTS["master"], seed + 4, f"login-map-v{i}-hover-master.png"):
        total_generated += 1
    else:
        failed += 1

print("\n" + "=" * 70)
print(f"BATCH GENERATION COMPLETE!")
print(f"Successfully generated: {total_generated} images")
print(f"Failed: {failed} images")
print("=" * 70)

print("\n[FILES GENERATED]")
print("Main Maps:")
for i in range(1, 5):
    print(f"  - login-map-v{i}.png")

print("\nHover States (per variation):")
for i in range(1, 5):
    print(f"  Variation {i}:")
    print(f"    - login-map-v{i}-hover-student.png")
    print(f"    - login-map-v{i}-hover-staff.png")
    print(f"    - login-map-v{i}-hover-admin.png")
    print(f"    - login-map-v{i}-hover-master.png")

print("\n[NEXT STEPS]")
print("1. Review the 4 main map variations (login-map-v1.png to v4.png)")
print("2. Choose your favorite variation")
print("3. Update Login.jsx to use the chosen variation and hover states")
print("4. Implement hover effect with quadrant-specific images")
print("=" * 70)
