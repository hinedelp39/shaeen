from PIL import Image, ImageColor
import os

source_path = "src/app/favicon.ico"
dest_path = "src/app/icon.png"
blue_color = ImageColor.getrgb("#3b7fbf")

try:
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found.")
        exit(1)

    img = Image.open(source_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        if item[3] == 0:
            new_data.append(item)
        else:
            # Apply blue color with original alpha
            new_data.append((*blue_color, item[3]))

    img.putdata(new_data)
    img.save(dest_path, "PNG")
    print(f"Successfully created blue icon at {dest_path}")

except Exception as e:
    print(f"An error occurred: {e}")
