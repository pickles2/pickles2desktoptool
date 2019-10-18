#!/bin/bash

TMP_DIR_PREFIX="_tmp_build_px2dt_";
TMP_DIR_NAME=$(date '+%Y%m%d_%H%M%S');
REPOSITORY_URL="https://github.com/pickles2/app-pickles2.git";
APPLE_IDENTITY='';
APPLE_CODESIGN_JSON='';

while getopts "is:" OPT
do
    case $OPT in
        "i" )
            APPLE_IDENTITY="$OPTARG"
            ;;
        "s" )
            APPLE_CODESIGN_JSON="$OPTARG"
            ;;
    esac
    shift `expr $OPTIND - 1`
done


BRANCH_NAME=$1;
if [ ! $1 ]; then
    BRANCH_NAME="develop";
fi

echo "-------------------------";
echo "build Start!";
echo "temporary dir = ~/${TMP_DIR_PREFIX}${TMP_DIR_NAME}/"
echo "repository = ${REPOSITORY_URL}"
echo "branch name = ${BRANCH_NAME}"
if [ $APPLE_IDENTITY ]; then
    echo "Apple IDENTITY = ${APPLE_IDENTITY}"
fi
if [ $APPLE_CODESIGN_JSON ]; then
    echo "apple_codesign.json = ${APPLE_CODESIGN_JSON}"
fi
echo $(date '+%Y/%m/%d %H:%M:%S');

sleep 1s; echo ""; echo "=-=-=-=-=-=-=-=-=-= making build directory";
mkdir ~/${TMP_DIR_PREFIX}${TMP_DIR_NAME};

sleep 1s; echo ""; echo "=-=-=-=-=-=-=-=-=-= git clone";
git clone --depth 1 -b ${BRANCH_NAME} ${REPOSITORY_URL} ~/${TMP_DIR_PREFIX}${TMP_DIR_NAME}/;

if [ $APPLE_CODESIGN_JSON ]; then
    cp ${APPLE_CODESIGN_JSON} ~/${TMP_DIR_PREFIX}${TMP_DIR_NAME}/apple_codesign.json;
fi
cd ~/${TMP_DIR_PREFIX}${TMP_DIR_NAME}/;
pwd

git submodule update --init --recursive --force;

sleep 1s; echo ""; echo "=-=-=-=-=-=-=-=-=-= composer install --no-dev";
composer install --no-dev;

sleep 1s; echo ""; echo "=-=-=-=-=-=-=-=-=-= npm install --only=production";
npm install --only=production;

sleep 1s; echo ""; echo "=-=-=-=-=-=-=-=-=-= npm install nw-builder";
npm install nw-builder;

if [ $APPLE_IDENTITY ]; then
    sleep 1s; echo ""; echo "=-=-=-=-=-=-=-=-=-= Saving Apple IDENTITY";
    echo "${APPLE_IDENTITY}";
    echo ${APPLE_IDENTITY} > ~/${TMP_DIR_PREFIX}${TMP_DIR_NAME}/apple_identity.txt
    sleep 1s; echo "";
fi

sleep 1s; echo ""; echo "=-=-=-=-=-=-=-=-=-= npm run build";
npm run build;

sleep 1s; echo "";
sleep 1s; echo "";
sleep 1s; echo "";
echo "-------------------------";
echo "build completed!";
pwd
echo $(date '+%Y/%m/%d %H:%M:%S');
echo "-------------------------";
exit;
