# 1. Introduction

CoreUI is a javascript library that contains various reusable types and functions that may be used either as building blocks forming the basis of UI elements or as helpers for various UI-related tasks.

As a Thingworx extension, on its own, Core UI doesn't do anything, but it provides the functionality required by other extensions such as `BMCollectionView`, `BMCodeHost`, `BMUpdater` or `BMView`.

# 2. Index

- [About](#about)
- [Usage](#usage)
- [Development](#development)
  - [Pre-Requisites](#pre-requisites)
  - [Development Environment](#development-environment)
  - [File Structure](#file-structure)
  - [Build](#build)  
  - [Deployment](#deployment)  
- [Credit/Acknowledgment](#creditacknowledgment)
- [License](#license)

# 3. About

CoreUI includes the following main "packages":
 - `BMCoreUI` contains types that are extensively used by all other components. These include:
    - `BMPoint` - Represents a 2D point.
    - `BMSize`  - Represents a 2D size.
    - `BMRect`  - Represents a 2D rectangle.
    - `BMInset` - Represents a set of insets that can be applied to each edge of a rectangle.
    - `BMIndexPath` - Represents sequence of indexes that can be followed to reach an object in a series of nested arrays.
    - `BMKeyPath` - Represents a sequence of key names that can be followed to reach an object in a series of nested objects.
    - `BMColor` - Enables working with CSS colors from javascript.
    - `BMAnimationContext` and related classes - The CoreUI animation engine.
 - `BMView` is a CoreUI extension to a DOM node through which additional functionality is added. This contains, among others the following important classes:
    - `BMView` - Primarily used for building constraint-based layouts
        - `BMLayoutConstraint` - Represents a constraint that should be satisfied between two views or a single view and a constant value
        - `BMLayoutEditor` - A visual editor for layout constraints.
        - `BMViewport` and `BMLayoutSizeClass` - Used for responsive layouts.
    - `BMWindow` is a subclass of `BMView` that creates a floating view that can be dragged and resized.
    - `BMCollectionView` is a sublcass of `BMView` that is a scrolling container that can display an arbitrary number of items whose position and size are controlled by a separate layout manager. It uses the following classes:
        - `BMCollectionViewCell` - A subclass of `BMView` that represents a single item displayed by a collection view. Its use typically involves creating and registering a subclass.
        - `BMCollectionViewLayout` - An object that manages the position and size of cells. It uses `BMCollectionViewLayoutAttributes` objects to declare those attributes.
        - `BMCollectionViewDataSet` - An interface that communicates the contents that a collection view should display.

# 4. Usage

## 4.1. With Thingworx

To install CoreUI on Thingworx, you can download one of the release packages and directly import it as an extension.

Alternatively, you can clone this repo and build the extension from it.

## 4.2. In other projects

CoreUI can be included as a javascript dependency with npm. Run `npm install bm-core-ui` in the root of your javascript project.

Alternatively, you can clone this repo and build the library from it. 

Both approaches will contain two versions of the library in these folders:
 * `build` - Contains an unminified version of CoreUI that preserves the individual modules and can be used with a bundler like webpack e.g.:
```ts
// index.ts
import {BMRectMakeWithX} from 'bm-core-ui'

let myRect: BMRect = BMRectMakeWithX(50, {y: 50, width: 100, height: 100});
```
 * `lib` - Contains a minified version of CoreUI where symbols are exported globally. This can be included directly as a script tag and symbols can be used directly e.g.:
 ```html
 <!-- index.html -->
 <script type="text/javascript" src="BMCoreUI.min.js"></script>
 <script type="text/javascript">
    let myRect = BMRectMakeWithX(50, {y: 50, width: 100, height: 100});
 </script>
 ```


# 5. Development

### 5.1. Pre-Requisites

The following software is required:

* [NodeJS](https://nodejs.org/en/): needs to be installed and added to the `PATH`. You should use the LTS version.
* [gulp command line utility](https://gulpjs.com/docs/en/getting-started/quick-start): is needed to run the build script.

The following software is recommended:

* [Visual Studio Code](https://code.visualstudio.com/): An integrated developer enviroment with great javascript and typescript support. You can also use any IDE of your liking, it just that most of the testing was done using VSCode.

### 5.2. Development Environment
In order to develop CoreUI you need to do the following:
1. Clone this repository
2. Open `package.json` and configure the `thingworxServer`, `thingworxUser` and `thingworxPassword` as needed.
3. Run `npm install`. This will install the development dependencies for the project.
4. Start working on the extension.

Note that whenever you add a new file to the extension, you should also declare it in `metadata.xml` in order for it to be included in the Thingworx extension. Additionally, if the files include comments from which additional definitions should be added to the Typescript definition file, they should be added in the build script in the `DTSFiles` array at the beginning of the script.

If the order of files is important, they will be combined in the order specified in `metadata.xml`.

### 5.3. File Structure
```
BMCoreUI
│   README.md         // this file
│   package.json      // here you specify Thingworx connection details
│   metadata.xml      // thingworx metadata file for this widget. This is automatically updated based on your package.json and build settings
│   LICENSE           // license file
│   Gulpfile.js       // build script
│   DTSGen.js         // a script that generates a Typescript definition file from the comments in CoreUI files
└───src               // main folder where your developement will take place
│   │   file1.js            // CoreUI javascript file
|   |   ...
│   └───images              // folder for image resources you are included in the widget
└───build             // temporary folder used during compilation
└───zip               // location of the built extension
```

### 5.4. Build
To build the extension, run `gulp` in the root of the project. This will generate an extension .zip file in the zip folder in the root of the project.

To build the extension and upload it to Thingworx, run `gulp upload` in the root of the project. The details of the Thingworx server to which the script will upload the extension are declared in the project's `package.json` file. These are:
 * `thingworxServer` - The server to which the extension will be uploaded.
 * `thingworxUser` and `thingworxPassword` - The credentials used for uploading. This should be a user that has permission to install extensions.

Both of the build tasks can optionally take the `--p` parameter. When this is specified, the build script will generate a production build. Unlike development builds, files in the production build will be combined and minified.

To build CoreUI as a library run `gulp --l`. This will create the following directories:
 * `build` - Contains an un-minified version of CoreUI that preserves the individual modules and can be used with a bundler like webpack.
 * `lib` - Contains a minified version of CoreUI where symbols are exported globally. This can be included as a script tag.

### 5.5. Deployment

Deployment to Thingworx is part of the build process as explained above. Alternatively, you can manually install the extension that is generated in the zip folder in the root of the project.

# 6. Credit/Acknowledgment
CoreUI uses the following the libraries:
* [Velocity.js](http://velocityjs.org): Used as the animation engine powering `BMAnimationContext` and as a fallback for when web animations are not supported or can't fully model requested animations.
* [kiwi.js](https://github.com/IjzerenHein/kiwi.js/): Used to solve the layout constraint equations for `BMView` layouts.
* [iScroll](https://github.com/cubiq/iscroll): Used in `BMScrollView` and `BMCollectionView` to handle scrolling in cases where it is required to map element positions to scroll offsets in ways that cannot be expressed purely in CSS. CoreUI uses a slightly modified version that is compatible with recent versions of Android.

# 7. License

[MIT License](LICENSE)