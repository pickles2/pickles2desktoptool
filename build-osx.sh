appname=dist/osx/Pickles2DesktopTool
rm -r ${appname}.app
mkdir ${appname}.app
cp -r node_modules/nodewebkit/nodewebkit/node-webkit.app/Contents ${appname}.app
zip -r ${appname}.app/Contents/Resources/app.nw ./app ./package.json ./node_modules
open ./${appname}.app
