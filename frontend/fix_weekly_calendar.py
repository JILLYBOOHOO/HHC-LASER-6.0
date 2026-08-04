import os
import re

file_path = r"c:\Users\church\Downloads\HHCLASER5.0-main\HHCLASER5.0-main\frontend\src\app\shared\components\weekly-calendar\weekly-calendar.component.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the messy function
correct_function = """  updateCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    this.currentTimeStr = h12 + ':' + m.toString().padStart(2, '0') + ' ' + ampm;
    
    if (h >= 8 && h < 18) {
      this.currentTopPos = ((h * 60) + m) - (8 * 60);
    } else {
      this.currentTopPos = -100;
    }
  }

  scrollToCurrentTime() {
    if (this.currentTopPos > 0 && this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.currentTopPos - 100;
    }
  }
}
"""

content = re.sub(
    r"  updateCurrentTime\(\) \{.*?\}\n$",
    correct_function,
    content,
    flags=re.DOTALL
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
