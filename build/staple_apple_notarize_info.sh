#!/bin/bash

CURRENT_DIR=$(pwd);
APP_NAME="Pickles2";

ZIPNAME=$1;
if [ ! $1 ]; then
    echo "Unknown ZIP File Name.";
    exit;
fi

echo "-------------------------";
echo "Staple Apple Notarize Info Start!";
echo "Current Dir = ${CURRENT_DIR}"
echo "ZIP File Name = ${ZIPNAME}"
echo $(date '+%Y/%m/%d %H:%M:%S');
echo "";
sleep 1s;

echo "--- unzip...";
unzip -qq -d "_tmp-apple-staple-app-zip/" "${ZIPNAME}";
sleep 1s;

echo "--- staple...";
xcrun stapler staple ./_tmp-apple-staple-app-zip/${APP_NAME}.app;
sleep 1s;

echo "--- rezip...";
cd ./_tmp-apple-staple-app-zip/;
zip -q -y -r "../apple-staple-app-tmp.zip" ".";
cd ${CURRENT_DIR};
sleep 1s;

echo "--- replace...";
rm ${ZIPNAME};
mv apple-staple-app-tmp.zip ${ZIPNAME};
sleep 1s;

echo "--- cleanup...";
rm -r _tmp-apple-staple-app-zip/;
sleep 1s;

echo "";
sleep 1s;

echo "Done!";
echo $(date '+%Y/%m/%d %H:%M:%S');
exit;
