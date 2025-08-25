/**
 * Unlock Only Locked Layers (JSX) + Simple Progress Bar
 * - Checks locks first, then unlocks only when needed (faster on big docs)
 * - Safe across layer types (DOM checks + Action Manager fallback)
 */

(function () {
  if (!app.documents.length) {
    alert("No open document found.");
    return;
  }
  var doc = app.activeDocument;

  // ---------- Tiny UI ----------
  var ui = new Window("palette", "Unlocking Layers…", undefined, {
    closeButton: false,
  });
  ui.orientation = "column";
  ui.alignChildren = ["fill", "top"];
  var msg = ui.add("statictext", undefined, "Preparing…");
  msg.characters = 44;
  var bar = ui.add("progressbar", undefined, 0, 100);
  bar.preferredSize = [360, 14];
  ui.show();
  ui.update();

  // ---------- Helpers ----------
  function isSet(L) {
    return L && L.typename === "LayerSet";
  }
  function isArt(L) {
    return L && L.typename === "ArtLayer";
  }
  function s2t(s) {
    return stringIDToTypeID(s);
  }

  function convertBackgroundIfAny(d) {
    try {
      var bottom = d.layers[d.layers.length - 1];
      if (bottom && bottom.isBackgroundLayer) {
        d.activeLayer = bottom;
        executeAction(
          s2t("convertToLayer"),
          new ActionDescriptor(),
          DialogModes.NO,
        );
      }
    } catch (e) {}
  }

  // Breadth-first to keep progress feeling steady
  function collectAllLayers(d) {
    var out = [],
      q = [].slice.call(d.layers);
    while (q.length) {
      var L = q.shift();
      out.push(L);
      if (isSet(L)) {
        for (var i = 0; i < L.layers.length; i++) q.push(L.layers[i]);
      }
    }
    return out;
  }

  // Read lock flags via DOM (cheap) and AM fallback (robust)
  function needsUnlock(L) {
    // 1) DOM probes (cheap; wrap each in try in case property not supported)
    try {
      if (L.allLocked) return true;
    } catch (e) {}
    try {
      if (L.pixelsLocked) return true;
    } catch (e) {}
    try {
      if (L.positionLocked) return true;
    } catch (e) {}
    try {
      if (L.transparentPixelsLocked) return true;
    } catch (e) {}

    // 2) AM fallback (layerLocking object)
    try {
      var ref = new ActionReference();
      // Target by ID if available (avoids changing selection)
      if (typeof L.id === "number") {
        ref.putIdentifier(s2t("layer"), L.id);
      } else {
        // Fallback: by ordinal target (less ideal)
        ref.putEnumerated(s2t("layer"), s2t("ordinal"), s2t("targetEnum"));
      }
      var desc = executeActionGet(ref);
      if (desc.hasKey(s2t("layerLocking"))) {
        var lock = desc.getObjectValue(s2t("layerLocking"));
        function b(k) {
          return lock.hasKey(s2t(k)) && lock.getBoolean(s2t(k));
        }
        if (
          b("protectAll") ||
          b("protectComposite") ||
          b("protectPosition") ||
          b("protectTransparency")
        ) {
          return true;
        }
      }
    } catch (e) {}

    return false; // appears unlocked
  }

  function unlockOne(L) {
    // Only set what might exist; each in try to avoid "command set is not available"
    try {
      L.allLocked = false;
    } catch (e) {}
    try {
      L.pixelsLocked = false;
    } catch (e) {}
    try {
      L.positionLocked = false;
    } catch (e) {}
    try {
      L.transparentPixelsLocked = false;
    } catch (e) {}
  }

  // ---------- Core ----------
  function run() {
    convertBackgroundIfAny(doc);

    var all = collectAllLayers(doc);

    // Pass 1: collect targets that actually need work
    msg.text = "Scanning for locked layers…";
    ui.update();
    app.refresh();
    var targets = [];
    for (var i = 0; i < all.length; i++) {
      try {
        if (needsUnlock(all[i])) targets.push(all[i]);
      } catch (e) {}
    }

    var total = Math.max(1, targets.length);
    var done = 0;
    bar.value = 0;
    msg.text = "Unlocking… 0 / " + total + " (skipping already-unlocked)";
    ui.update();

    // If nothing to do, finish quickly
    if (targets.length === 0) {
      bar.value = 100;
      msg.text = "Nothing was locked — all clear!";
      ui.update();
      $.sleep(150);
      return;
    }

    // Update cadence (bigger = faster, choppier bar)
    var UI_UPDATE_EVERY = 12;

    for (var j = 0; j < targets.length; j++) {
      unlockOne(targets[j]);
      done++;

      if (done % UI_UPDATE_EVERY === 0 || done === total) {
        var pct = Math.min(100, Math.round((done * 100) / total));
        bar.value = pct;
        msg.text = "Unlocking… " + done + " / " + total;
        ui.update();
        app.refresh();
        $.sleep(0);
      }
    }
  }

  try {
    // Not wrapping the whole run in one suspendHistory keeps the UI responsive.
    run();
    bar.value = 100;
    msg.text = "Done!";
    ui.update();
    $.sleep(180);
  } catch (err) {
    try {
      ui.close();
    } catch (e) {}
    alert("Error: " + err);
    return;
  } finally {
    try {
      ui.close();
    } catch (e) {}
  }

  alert("✅ Finished. Locked layers/groups were unlocked.");
})();
