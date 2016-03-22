#!/bin/sh

# 元ファイル
# source.png	1024x1024
​
convert -resize 16x16 -verbose source.png dist/icon_16x16.png
convert -resize 32x32 -verbose source.png dist/icon_16x16@2x.png
convert -resize 32x32 -verbose source.png dist/icon_32x32.png
convert -resize 64x64 -verbose source.png dist/icon_32x32@2x.png
convert -resize 128x128 -verbose source.png dist/icon_128x128.png
convert -resize 256x256 -verbose source.png dist/icon_128x128@2x.png
convert -resize 256x256 -verbose source.png dist/icon_256x256.png
convert -resize 512x512 -verbose source.png dist/icon_256x256@2x.png
convert -resize 512x512 -verbose source.png dist/icon_512x512.png
convert -resize 1024x1024 -verbose source.png dist/icon_512x512@2x.png
convert -resize 1024x1024 -verbose source.png dist/icon_1024x1024.png
