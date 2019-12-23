const {createTypeScriptDefinitionsWithContent} = require('./DTSGen');

const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');
const del = require('del');
const deleteEmpty = require('delete-empty');

const { series, src, dest } = require('gulp');
const zip = require('gulp-zip');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const babel = require('gulp-babel')

const request = require('request');

const packageJson = require('./package.json');

/**
 * Files to remove from the build.
 */
const removeFiles = [

    // These files represent interface definitions and are not meant to be included in the final package
    'BMCollectionView/BMCollectionViewDelegate.js',
    'BMCollectionView/BMCollectionViewDataSet.js',
    'BMWindow/BMWindowDelegate.js',
    'BMView/BMLayoutVariableProvider.js',

    // These files are in early development
    'BMScrollView.js',
    'Core/BMDragController.js',
    'BMScroller.js',
    'Core/BMInterpolator.js',

    // These files were included for documentation and are not needed at runtimea
    'JSDoc.html',
    'DTS.html',
    'BMViewTesting.html',
    'BMViewReadme.md',

    // These files are either unused at runtime or generated automatically
    'TWWidget.d.ts',
    'Velocity.d.ts',
    'velocity2.d.ts',
    'BMCoreUI.d.ts',
    'BMCoreUITypes.ts',
    'BMCoreUITypes.d.ts',
    'DTSGen.js',
    'DTSGenOutput.d.ts',

    // These files now have newer versions
    'BMView_sizeClass.js',
    'BMLayoutConstraint_sizeClass.js',
    'BMView.js',
    'BMLayoutConstraint.js',
    'BMLayoutEditor_sizeClass.js',

    // These files are now taken from npm
    'kiwi.min.js',
    'kiwi_v1.0.min.js',
    'velocity204.min.js',
    'ZVelocity.js',
    'velocity.min.js',
    'velocity.js',
    'kiwi.js'
];

/**
 * Files for which modules will be disabled in extension mode.
 */
const noModuleFiles = [
    'kiwi.js',
    'velocity.js'
];

/**
 * Files that should only exist for the extension.
 */
const extensionFiles = [];

/**
 * Files from which the typescript definitions are created.
 */
const DTSFiles = [
    'Core/BMCoreUI.js', 
    'Core/BMInset.js',
    'Core/BMPoint.js',
    'Core/BMSize.js',
    'Core/BMRect.js',
    'Core/BMFunctionCollection.js',
    'Core/BMAnimationContext.js',
    'Core/BMIndexPath.js',
    'Core/BMKeyPath.js',
    'Core/BMColor.js',
    'BMView/BMLayoutSizeClass.js',
    'BMView/BMViewport.js',
    'BMView/BMLayoutConstraint_v2.5.js', 
    'BMView/BMView_v2.5.js', 
    'BMView/BMScrollView.js', 
    'BMView/BMLayoutGuide.js', 
    'BMView/BMAttributedLabelView.js', 
    'BMView/BMLayoutEditor.js', 
    'BMView/BMLayoutVariableProvider.js', 
    'BMView/BMMenu.js',
    'BMView/BMTextField.js',
    'BMView/BMTextFieldDelegate.js',
    'BMCollectionView/BMCollectionViewLayoutAttributes.js', 
    'BMCollectionView/BMCollectionViewCell.js', 
    'BMCollectionView/BMCollectionViewLayout.js', 
    'BMCollectionView/BMCollectionViewFlowLayout.js', 
    'BMCollectionView/BMCollectionViewMasonryLayout.js', 
    'BMCollectionView/BMCollectionViewTileLayout.js', 
    'BMCollectionView/BMCollectionViewStackLayout.js', 
    'BMCollectionView/BMCollectionView.js', 
    'BMCollectionView/BMCollectionViewDataSet.js', 
    'BMCollectionView/BMCollectionViewDelegate.js', 
    'BMWindow/BMWindow.js', 
    'BMWindow/BMToolWindow.js', 
    'BMWindow/BMWindowDelegate.js', 
    'BMCodeEditor/BMCodeEditor.js', 
];

/**
 * Command line arguments; the following are supported:
 * * __--p__: Creates a production build that is combined and minified
 * * __--l__: Implies `--p`; builds a library version that can be used outside of thingworx. Incompatible with the upload task. Currently unsupported.
 */
const args = (argList => {
    let arg = {}, a, opt, thisOpt, curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');
        
        if (opt === thisOpt) {
            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        }
        else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }
    return arg;
})(process.argv);

const outPath = args.l ? 'build' : `build/ui/${packageJson.packageName}`;
const libPath = 'lib';
const packageKind = args.p ? 'min' : 'dev';
const zipName = `${packageJson.packageName}-${packageKind}-${packageJson.version}.zip`;

/**
 * Cleans the build directory.
 */
async function cleanBuildDir(cb) {
    await del('build');
    await del('zip');
    await del('lib');
    
    const paths = outPath.split('/');
    for (let i = 1; i < paths.length; i++) {
        paths[i] = paths[i - 1] + '/' + paths[i];
    }

    for (const path of paths) {
        fs.mkdirSync(path);
    }

    if (args.l) {
        fs.mkdirSync('lib');
    }

    // When building the extension, recreate the zip folder
    await del('zip/**');
    if (!args.l) fs.mkdirSync('zip');

    cb();
}

/**
 * Copies files into the build directory.
 */
function copy(cb) {
    src('src/**')
        .pipe(dest(`${outPath}/`))
        .on('end', () => {
            fs.copyFileSync('metadata.xml', 'build/metadata.xml');
            cb();
        });
}

async function prepareBuild(cb) {

    // Create the typescript definitions
    const DTSSource = DTSFiles.map(f => `${outPath}/${f}`).map(f => fs.readFileSync(f, {encoding: 'utf8'})).join('\n');
    const DTS = createTypeScriptDefinitionsWithContent(DTSSource);

    // Remove unneeded files
    await del(removeFiles.map(f => `${outPath}/${f}`));

    // When building for Thingworx, modules are not supported, so imports and exports are stripped
    if (!args.l) {
        fs.writeFileSync(`${outPath}/BMCoreUI.d.ts`, DTS, {encoding: 'utf8'});

        // Copy required dependencies
        for (const dependency in packageJson.dependencies) {
            const dependencyPackageJson = require(`./node_modules/${dependency}/package.json`);
            await new Promise(resolve => src(`node_modules/${dependency}/${dependencyPackageJson.main}`).pipe(dest(outPath)).on('end', resolve));
        }

        // Disable modules as needed
        for (const file of noModuleFiles.map(f => `${outPath}/${f}`)) {
            const content = fs.readFileSync(file, {encoding: 'utf8'});
            fs.writeFileSync(file, `(function (){const define = undefined, module = undefined, exports = undefined; ${content}})()`, {encoding: 'utf8'});
        }

        await new Promise(resolve => {
            src(`${outPath}/**/*.js`)
                .pipe(babel({plugins: ['remove-import-export']}))
                .pipe(dest(`${outPath}`))
                .on('end', resolve);
        })
    }
    else {
        // Remove extension only files
        await del(extensionFiles.map(f => `${outPath}/${f}`));

        fs.mkdirSync(`${outPath}/@types`);
        fs.mkdirSync(`${libPath}/@types`);

        fs.writeFileSync(`${libPath}/@types/BMCoreUI.min.d.ts`, DTS, {encoding: 'utf8'});

        // Create a second definitions file with the module
        const moduleDTS = createTypeScriptDefinitionsWithContent(DTSSource, {modules: true});
        fs.writeFileSync(`${outPath}/@types/index.d.ts`, moduleDTS, {encoding: 'utf8'});
    }

    // In production mode, it is needed to minify the files, based on how they are defined in the metadata file
    if (args.p || args.l) {
        // When building the extensions, files are to be minimized based on their declaration in the metadata xml
        const metadataFile = await new Promise(resolve => fs.readFile('build/metadata.xml', 'utf8', (err, data) => resolve(data)));

        const metadataXML = await new Promise(resolve => xml2js.parseString(metadataFile, (err, result) => resolve(result)));

        const fileResources = metadataXML.Entities.Widgets[0].Widget[0].UIResources[0].FileResource;

        // Separate the files into groups depending on how they are to be minified
        const fileGroups = [
            {isDevelopment: true, isRuntime: true, extension: 'min'},
            {isDevelopment: false, isRuntime: true, extension: 'runtime'},
            {isDevelopment: true, isRuntime: false, extension: 'ide'}
        ];
        for (const group of fileGroups) {
            group.files = fileResources.filter(resource => {
                const include = (group.isDevelopment ? resource.$.isDevelopment == 'true' : resource.$.isDevelopment != 'true') &&
                    (group.isRuntime ? resource.$.isRuntime == 'true' : resource.$.isRuntime != 'true') && resource.$.type == 'JS' && !!resource.$.file;

                // Ensure that the file exists
                if (include && !fs.existsSync(`${outPath}/${resource.$.file}`)) {
                    console.warn(`Skipping file ${outPath}/${resource.$.file} which does not exist.`);
                    return false;
                }

                return include;
            }).map(r => r.$.file);
        }

        // Rebuild the metadata file with the correct file structure, adding back all URL references and non-JS files
        metadataXML.Entities.Widgets[0].Widget[0].UIResources[0].FileResource = fileResources.filter(resource => {
            return resource.$.type != 'JS' || !resource.$.file;
        });

        // Combine each of the file groups
        for (const group of fileGroups) {
            if (group.files.length) {
                const name = `${packageJson.packageName}.${group.extension}`;
                // If any files belong to this group, combine them
                await new Promise(async resolve => {
                    let stream = src(group.files.map(f => `${outPath}/${f}`));

                    // When building the library, strip imports and exports for the minified file
                    if (args.l) {
                        stream = stream.pipe(babel({
                            plugins: [['remove-import-export', {
                                removeImport: true,
                                removeExport: true,
                                removeExportDefault: true,
                                preseveNamedDeclaration: true
                            }]]
                        }));
                    }
                    else {
                    }

                    stream.pipe(concat(`${name}.js`))
                        .pipe(terser({compress: true, mangle: {reserved: ['module', 'exports', 'define']}}))
                        .pipe(dest(`${args.l ? libPath : outPath}`))
                        .on('end', resolve);
                });

                // Destroy the individual files when building the widget
                await del(group.files.map(f => `${args.l ? libPath : outPath}/${f}`));

                // Reference the file in metadata
                metadataXML.Entities.Widgets[0].Widget[0].UIResources[0].FileResource.push({
                    $: {
                        type: 'JS',
                        file: `${name}.js`,
                        description: '',
                        isDevelopment: group.isDevelopment.toString(),
                        isRuntime: group.isRuntime.toString()
                    }
                });
            }
        }

        // Update the version and updater info
        // For the version, strip the "beta" or "alpha" components if they exist, as they are unsupported by Thingworx
        metadataXML.Entities.ExtensionPackages[0].ExtensionPackage[0].$.packageVersion = packageJson.version.split('-')[0];
        metadataXML.Entities.ExtensionPackages[0].ExtensionPackage[0].$.buildNumber = JSON.stringify(packageJson.autoUpdate);

        // Write out the updated metadata
        const builder = new xml2js.Builder();
        const outXML = builder.buildObject(metadataXML);

        await new Promise(resolve => fs.writeFile('build/metadata.xml', outXML, resolve));

        // Clean out the empty folder structure
        await deleteEmpty(`${outPath}/`);
    }

    if (!args.l) {
        // Create a zip of the build directory
        const zipStream = src('build/**')
            .pipe(zip(zipName))
            .pipe(dest('zip'));
    
        await new Promise(resolve => zipStream.on('end', resolve));
    }
    else {
        await del(`${outPath}/metadata.xml`);
    }

    cb();
}

async function upload(cb) {
    const host = packageJson.thingworxServer;
    const user = packageJson.thingworxUser;
    const password = packageJson.thingworxPassword;

    return new Promise((resolve, reject) => {
        request.post({
            url: `${host}/Thingworx/Subsystems/PlatformSubsystem/Services/DeleteExtensionPackage`,
            headers: {
                'X-XSRF-TOKEN': 'TWX-XSRF-TOKEN-VALUE',
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-THINGWORX-SESSION': 'true'
            },
            body: {packageName: packageJson.packageName},
            json: true
        },
        function (err, httpResponse, body) {
            // load the file from the zip folder
            let formData = {
                file: fs.createReadStream(
                    path.join('zip', zipName)
                )
            };
            // POST request to the ExtensionPackageUploader servlet
            request
                .post(
                    {
                        url: `${host}/Thingworx/ExtensionPackageUploader?purpose=import`,
                        headers: {
                            'X-XSRF-TOKEN': 'TWX-XSRF-TOKEN-VALUE'
                        },
                        formData: formData
                    },
                    function (err, httpResponse, body) {
                        if (err) {
                            console.error("Failed to upload widget to thingworx");
                            reject(err);
                            return;
                        }
                        if (httpResponse.statusCode != 200) {
                            reject(`Failed to upload widget to thingworx. We got status code ${httpResponse.statusCode} (${httpResponse.statusMessage})`);
                        } else {
                            console.log(`Uploaded widget version ${packageJson.version} to Thingworx!`);
                            resolve();
                        }
                    }
                )
                .auth(user, password);

            if (err) {
                console.error("Failed to delete widget from thingworx");
                return;
            }
            if (httpResponse.statusCode != 200) {
                console.log(`Failed to delete widget from thingworx. We got status code ${httpResponse.statusCode} (${httpResponse.statusMessage})
                body:
                ${httpResponse.body}`);
            } else {
                console.log(`Deleted previous version of ${packageJson.packageName} from Thingworx!`);
            }
        })
        .auth(user, password);
    })
}

exports.default = series(cleanBuildDir, copy, prepareBuild);
exports.upload = series(cleanBuildDir, copy, prepareBuild, upload);
