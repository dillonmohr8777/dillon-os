# Design assets

## App icon

`app-icon.html` is the source for the 1024×1024 App Store icon (the Mohr Media
tricolor swoosh on the warm ground color). Regenerate the PNG with headless
Chromium — no design tool or Mac required:

```sh
chromium --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1024,1024 --screenshot=icon-1024.png "file://$PWD/app-icon.html"
cp icon-1024.png ../ios/MohrAgents/Assets.xcassets/AppIcon.appiconset/icon-1024.png
```

Xcode 14+ accepts the single 1024px image and derives every other size at
build time (see `AppIcon.appiconset/Contents.json`).
