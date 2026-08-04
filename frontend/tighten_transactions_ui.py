import os
import re

file_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\features\admin\transactions\admin-transactions.component.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace padding and spacing
content = content.replace('p-8 max-w-7xl mx-auto space-y-8', 'p-4 max-w-7xl mx-auto space-y-4')

# Replace KPI card height and padding
content = content.replace('h-[140px]', '')
content = content.replace('p-6 bg-[#4CA771]', 'p-4 bg-[#4CA771]')
content = content.replace('p-6 bg-[#D8C7AB]', 'p-4 bg-[#D8C7AB]')
content = content.replace('p-6 bg-[#E85C71]', 'p-4 bg-[#E85C71]')
content = content.replace('p-6 bg-[#333333]', 'p-4 bg-[#333333]')

# Reduce vertical space in header
content = content.replace('pb-4', 'pb-2')
content = content.replace('mt-2 max-w-md', 'mt-1 max-w-md')

# Reduce table cell vertical padding
content = content.replace('py-4 px-2', 'py-2 px-2')
content = content.replace('pt-6', 'pt-2')
content = content.replace('pt-4', 'pt-2')
content = content.replace('py-3 px-2', 'py-2 px-2')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
