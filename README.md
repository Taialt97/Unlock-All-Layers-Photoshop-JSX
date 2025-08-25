# Unlock All Layers (Photoshop JSX)

A simple Photoshop **ExtendScript (JSX)** that unlocks all locked layers and groups in the active document.  
This script can convert a Background into a normal layer, detect which layers are actually locked, and only unlock those targets (for speed). It also displays a minimal progress bar while running.

---

## Features
- ✅ Converts Background layer into a normal layer if present.  
- ✅ Recursively unlocks all **ArtLayers** and **LayerSets**.  
- ✅ Checks each layer first — only unlocks if it’s locked (faster on large docs).  
- ✅ Displays a lightweight progress bar with live counter.  
- ✅ Safe: wraps unlock calls in `try/catch` to avoid “The command set is not available” errors.  

---

## Installation
1. Save the script as **`unlock-all-layers.jsx`**.  
2. Place the file into Photoshop’s Scripts folder:  
   - **Windows:** `C:\Program Files\Adobe\Adobe Photoshop <version>\Presets\Scripts\`  
   - **macOS:** `/Applications/Adobe Photoshop <version>/Presets/Scripts/`  
3. Restart Photoshop.  

---

## Usage
- Open any Photoshop document.  
- Go to **File → Scripts → Unlock All Layers** (or **File → Scripts → Browse…** and select the `.jsx`).  
- The script will:
  - Convert the Background layer (if present).  
  - Scan the document for locked layers.  
  - Unlock only those that are locked.  
  - Show a progress bar and finish with a “Done” alert.  

---

## Notes
- Works in Photoshop **CC 2019 and newer** (and often older).  
- If no layers are locked, the script exits quickly with a message.  
- Does not alter visibility, blend modes, or structure — only clears lock flags.  
- Supports:
  - `allLocked`
  - `pixelsLocked`
  - `positionLocked`
  - `transparentPixelsLocked`

---

## Example
When running on a file with locked groups and layers:
Unlocking… 0 / 23
Unlocking… 12 / 23
Unlocking… 23 / 23
Done!

---

## License
Free to use, modify, and share. Attribution appreciated.

