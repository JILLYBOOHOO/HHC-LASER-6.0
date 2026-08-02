import os

image_dir = r"c:\Users\Amber Student\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\public\hhclaser_img\hhclaser_images"
md_path = r"c:\Users\Amber Student\.gemini\antigravity-ide\brain\288cbf76-8828-4061-91e8-8552b16011bc\scratch\images_list.md"

with open(md_path, "w") as f:
    f.write("# Images List\n\n")
    for file in os.listdir(image_dir):
        if file.endswith(".webp") or file.endswith(".jpg") or file.endswith(".png"):
            # Ensure the path uses forward slashes for markdown compatibility
            file_path = os.path.join(image_dir, file).replace("\\", "/")
            f.write(f"## {file}\n")
            f.write(f"![{file}](file:///{file_path})\n\n")
