import requests
from bs4 import BeautifulSoup
import os
import urllib.request
import re

url = "https://hhclaser.com/gallery"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

images = []
for img in soup.find_all('img'):
    src = img.get('src')
    if src and not src.startswith('data:'):
        if src.startswith('/'):
            src = "https://hhclaser.com" + src
        elif not src.startswith('http'):
            src = "https://hhclaser.com/" + src
        if 'logo' not in src.lower() and 'visa' not in src.lower() and 'mastercard' not in src.lower():
             images.append(src)

print(images)

target_dir = r"C:\Users\Amber Student\Downloads\HCC LASER\frontend\public\gallery"
os.makedirs(target_dir, exist_ok=True)

for i, img_url in enumerate(images):
    ext = img_url.split('.')[-1].split('?')[0]
    if len(ext) > 4:
        ext = 'jpg'
    file_path = os.path.join(target_dir, f"gallery_{i+1}.{ext}")
    print(f"Downloading {img_url} to {file_path}")
    try:
        urllib.request.urlretrieve(img_url, file_path)
    except Exception as e:
        print(f"Failed to download {img_url}: {e}")
