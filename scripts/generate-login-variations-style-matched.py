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
                "cfg": 7.0,
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
                "text": "photo, photograph, realistic, 3d render, CGI, digital art, blurry, messy, unclear, colored, chromatic, rainbow, watercolor, oil painting, acrylic, detailed shading, heavy crosshatch, dense patterns, cluttered, busy, complex, ornate",
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
                "filename_prefix": "ncadbook_style_matched",
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

# Main prompt - matching Edward Murphy Library clean simple style
MAIN_PROMPT = """Simple clean line drawing illustration, isometric bird's eye view of NCAD campus divided into 4 quadrants, minimal detail, thin confident pen lines on white paper, hand-lettered text labels, sparse simple furniture and objects, Edward Murphy Library map style, top left quadrant labeled "STUDENT ZONE" with simple desks chairs easels books, top right quadrant labeled "STAFF AREA" with office furniture meeting table, bottom left quadrant labeled "ADMIN OFFICE" with filing cabinets desk, bottom right quadrant labeled "MASTER CONTROL" with reception desk, center has "NCAD" text, simple building outlines, minimal crosshatch shading only on building walls, clean white background, loose sketchy lines, hand-drawn casual style, architectural line drawing, birds flying, small potted plants, very minimal objects, lots of white space, uncluttered composition, monochromatic black ink only, simple perspective, educational institution map aesthetic"""

# Hover state prompts - minimal simple zoomed details
HOVER_PROMPTS = {
    "student": """Simple clean line drawing zoomed view of NCAD student area, minimal detail, thin pen lines on white paper, hand-lettered "STUDENT ZONE" label, sparse furniture: simple desks chairs easels, few books scattered, one potted plant, birds flying, Edward Murphy Library illustration style, isometric view, very minimal crosshatch on furniture edges only, lots of white space, clean uncluttered, casual hand-drawn lines, architectural sketch aesthetic, monochromatic black ink only""",

    "staff": """Simple clean line drawing zoomed view of NCAD staff area, minimal detail, thin pen lines on white paper, hand-lettered "STAFF AREA" label, sparse furniture: office desk meeting table chairs, few papers portfolios, one plant, Edward Murphy Library illustration style, isometric view, very minimal crosshatch on furniture edges only, lots of white space, clean uncluttered, casual hand-drawn lines, architectural sketch aesthetic, monochromatic black ink only""",

    "admin": """Simple clean line drawing zoomed view of NCAD admin office, minimal detail, thin pen lines on white paper, hand-lettered "ADMIN OFFICE" label, sparse furniture: filing cabinet desk chair, few folders, one plant, Edward Murphy Library illustration style, isometric view, very minimal crosshatch on furniture edges only, lots of white space, clean uncluttered, casual hand-drawn lines, architectural sketch aesthetic, monochromatic black ink only""",

    "master": """Simple clean line drawing zoomed view of NCAD master control area, minimal detail, thin pen lines on white paper, hand-lettered "MASTER CONTROL" label, sparse furniture: reception desk chairs, NCAD sign, one plant, Edward Murphy Library illustration style, isometric view, very minimal crosshatch on furniture edges only, lots of white space, clean uncluttered, casual hand-drawn lines, architectural sketch aesthetic, monochromatic black ink only"""
}

# Random seeds for 4 variations
SEEDS = [
    random.randint(1, 1000000000),
    random.randint(1, 1000000000),
    random.randint(1, 1000000000),
    random.randint(1, 1000000000)
]

print("=" * 70)
print("NCAD LOGIN MAP - STYLE-MATCHED BATCH GENERATION")
print("Edward Murphy Library Clean Simple Line Drawing Style")
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

print("\n[STYLE CHARACTERISTICS]")
print("- Clean simple line drawing (minimal detail)")
print("- Thin confident pen lines on white paper")
print("- Hand-lettered text labels")
print("- Sparse simple furniture and objects")
print("- Minimal crosshatch shading (edges only)")
print("- Lots of white space, uncluttered")
print("- Casual hand-drawn lines")
print("- Monochromatic black ink only")

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
print("1. View at: http://localhost:5178/preview-variations.html")
print("2. Choose your favorite variation")
print("3. Update Login.jsx mapVariation state to selected version")
print("=" * 70)
