import json
import urllib.request
import urllib.parse
import random
import time

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

# Simple SDXL workflow
workflow = {
    "3": {
        "inputs": {
            "seed": random.randint(1, 1000000000),
            "steps": 20,
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
            "text": "simple hand-drawn sketch map NCAD campus Dublin, thick black marker pen on white paper, loose confident strokes, minimal detail, 4 quadrants bird's eye view: TOP-LEFT student books and easels, TOP-RIGHT staff workspace with art supplies, BOTTOM-LEFT admin desks and files, BOTTOM-RIGHT master control with crown, center NCAD circular logo, modern gallery building corner, old granary outline, simple cobblestone paths, very minimal shading, bold line weight, sketchy loose style, Edward Murphy Library map aesthetic, clean white background, monochromatic black ink only",
            "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode"
    },
    "7": {
        "inputs": {
            "text": "photo, photograph, realistic, 3d render, blurry, messy, unclear, colored, chromatic, watercolor, painting",
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
            "filename_prefix": "ncadbook_login_map",
            "images": ["8", 0]
        },
        "class_type": "SaveImage"
    }
}

print("=" * 60)
print("Generating artistic login map with ComfyUI (SDXL)")
print("=" * 60)
print("Model: Juggernaut XL Ragnarok")
print("Prompt: Architectural hand-drawn quadrant map")
print("Steps: 20 | CFG: 7.0 | Size: 1024x1024")
print("=" * 60)

try:
    # Queue the prompt
    prompt_response = queue_prompt(workflow)
    prompt_id = prompt_response['prompt_id']
    print(f"\nPrompt queued with ID: {prompt_id}")
    print("Generating image (this may take 60-120 seconds)...")
    print("Progress: ", end="", flush=True)

    # Wait for completion
    while True:
        history = get_history(prompt_id)
        if prompt_id in history:
            break
        time.sleep(2)
        print(".", end="", flush=True)

    print("\n\nGeneration complete!")

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
                output_path = r"c:\Users\jones\AIprojects\NCADbook\public\login-map-generated.png"
                with open(output_path, 'wb') as f:
                    f.write(image_bytes)

                print(f"\nImage saved to: {output_path}")
                print(f"Original filename: {image_data['filename']}")
                print(f"File size: {len(image_bytes) / 1024:.1f} KB")

    print("\n" + "=" * 60)
    print("SUCCESS! Image generated and saved.")
    print("=" * 60)
    print("\nNext step:")
    print("Update Login.jsx line 68:")
    print('  <image href="/login-map-generated.png" width="1200" height="1200" />')
    print("=" * 60)

except Exception as e:
    print(f"\n\nERROR: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure ComfyUI is running (http://127.0.0.1:8188)")
    print("2. Check that the model 'juggernautXL_ragnarokBy.safetensors' is loaded")
    print("3. Check ComfyUI console for errors")
