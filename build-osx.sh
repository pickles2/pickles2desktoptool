appname=dist/osx/Pickles2DesktopTool
rm -r ${appname}.app
mkdir ${appname}.app
cp ./app/common/images/px2-osx.icns node_modules/nodewebkit/nodewebkit/node-webkit.app/Contents/Resources/nw.icns
cp -r node_modules/nodewebkit/nodewebkit/node-webkit.app/Contents ${appname}.app
zip -r ${appname}.app/Contents/Resources/app.nw ./app ./package.json ./node_modules
#open ./${appname}.app
open ./dist/osx/
