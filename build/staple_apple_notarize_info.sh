#!/bin/bash

CURRENT_DIR=$(pwd);
REPOSITORY_URL="https://github.com/pickles2/app-pickles2.git";

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
unzip -qq -d "Pickles2-tmp/" "${ZIPNAME}";
sleep 1s;

echo "--- staple...";
xcrun stapler staple ./Pickles2-tmp/Pickles2.app;
sleep 1s;

echo "--- rezip...";
cd ./Pickles2-tmp/;
zip -q -y -r "../Pickles2-tmp.zip" ".";
cd ${CURRENT_DIR};
sleep 1s;

echo "--- replace...";
rm ${ZIPNAME};
mv Pickles2-tmp.zip ${ZIPNAME};
sleep 1s;

echo "--- cleanup...";
rm -r Pickles2-tmp/;
sleep 1s;

echo "";
sleep 1s;

echo "Done!";
echo $(date '+%Y/%m/%d %H:%M:%S');
exit;
