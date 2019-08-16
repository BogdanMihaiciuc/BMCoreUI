# Introduction to CoreUI

CoreUI is a library that contains various reusable types and functions that may be used either as building blocks forming the basis of UI elements or as helpers for various UI-related tasks. They are built using the latest features of the JavaScript language and also support using in TypeScript projects via a definitions file.

This document will cover the basics of using CoreUI classes.

## Generic information

CoreUI adheres to certain style guidelines which are applied throughout the project. The more important ones are outlined below.

#### Naming conventions

All CoreUI types and globally accesible symbols are prefixed with `BM` to avoid naming collisions with other projects.

Function and method names typically follow the convention of starting with the returned result if there is one, then specifying the action taken and finally the name of the first parameter if there is one e.g.:

```js
rect1.rectByIntersectingWithRect(rect2);
```

When declaring functions and methods, these almost always take at most two parameters:
 - The first parameter, if it exists, is specified in the function's name e.g. `BMInsetMakeWithEqualInsets(_)`.
 - All other parameters are grouped together in an object. The purpose of this is to increase the readability when invoking functions:
 
 ```js
 // C-style function call - it is not clear by just reading this line what each parameter means:
BMRectMake(20, 50, 75, 125);

// Typical CoreUI function - each parameter has a clear label making it easy to tell at a glance which is which:
BMRectMakeWithX(20, {y: 50, width: 75, height: 125});
 ```

An exception is made for methods that are invoked on delegate objects. In this case, the method name always begins with the un-prefixed name of the calling class. The method's first parameter is always the calling object and the remaining parameters use the same convention as described above:
```js
delegate.collectionViewDidSelectCell(this, cell, {atIndexPath: selectedIndexPath});
```

Even when not using typescript, methods have clearly documented types and nullability for the parameters. When all of the properties of the parameters object are nullable, the entire second object may be omitted. Typically, but not always, if the first parameter is optional, all other parameters are optional as well.

When a parameter is nullable, its description will typically state what happens when the parameter is omitted. In many cases a sensible default is used instead.

Note that CoreUI does not verify types or nullability but failing to adhere to the documented types may lead to problems down the road that might be difficult to debug.

#### Object creation

CoreUI types are typically not instantiated through the `new` operator. Instead, each class provides several factory methods from which it is constructed, either as global functions or as static methods. The purpose of this is again to improve the readability, especially if classes can be constructed in more than one way.

Most classes have at least one initializer method that is invoked immediately after creation. These methods always start with `init`. When classes have more than one initializer, one of them is named the designated initializer and is guaranteed to be invoked by all other initializer methods.

When extending from CoreUI classes and overriding an initializer method, the subclass implementation must invoke the superclass initializer early on in its implementation to ensure that the superclass components are correctly initialized.

#### Error handling

CoreUI methods neither throw nor expect errors to be thrown when invoking other methods for errors that occur during the normal functioning of the application.

If a CoreUI method throws, this represents a programming error that should be corrected (for example passing in an undefined value to a non-optional parameter) and you should generally not attempt to catch and treat the error at runtime as the CoreUI class that has thrown it will be left in an undefined state and may stop functioning correctly. An error thrown by CoreUI might also indicate a bug in CoreUI itself and you may create an issue on this website if you think you have encountered such a bug.

Some methods may specify situations in which they throw, for example if they are invoked with certain combinations of parameter values or if they cannot be invoked at certain times. For example, marking a constraint as active will throw if the views it applies to are not part of the same view hierarchy.

Similarly, CoreUI will never attempt to catch errors thrown by methods it invokes, such as methods on delegate objects. If code within those methods can throw errors normally, it is important to catch and handle these errors before control reaches back to CoreUI. If the thrown error propagates up to CoreUI, it may leave the calling class in an undefined state, preventing it from functioning correctly.

## Primitive types

CoreUI includes a number of primitive types and global functions that can be used in a wide variety of situations. They are also used extensively throughout the more complex CoreUI types.

### **`BMInset`**

BMInset is a class that represents an inset that can be applied to a rectangle or area of the screen. In CoreUI inset objects are for example used to specify insets for Collection View layouts or CSS paddings for views.

To create an insets object, invoke one of the available factory methods:

```js
let inset = BMInsetMakeWithLeft(10, {top: 15, right: 20, bottom: 25}); // Creates an inset by specifying the values of each edge
let inset = BMInsetMakeWithEqualInsets(10); // Creates an inset with all four edges having the same values

// A short-hand constructor is also available, but not recommended because it is not as readable
let inset = BMInsetMake(10, 15, 20, 25);
```

The various insets are then available through the `left`, `top`, `right` and `bottom` properties of the inset object.

Like many CoreUI primitive types, insets can be duplicated by invoking the `copy()` method.

### **`BMPoint`**

BMPoint represents a two-dimensional point. Its main purpose in CoreUI is typically to indicate positions on the screen. It is primarily made up of two numeric properties: `x` and `y` which are coordinates in an arbitrary measurement system. In CoreUI, they almost always represent pixel coordinates.

Points can be copied using the `copy()` method and also support being interpolated as part of an animation. If one of your custom classes has a point property, it is directly animatable using decorators and animation controllers with no additional implementation required.

##### Creating a point
```js
let point = BMPointMakeWithX(10, {y: 15}); // Creates a point with the given coordinates
let point = BMPointMake(10, 15); // Short-hand notation
```

##### Accessing coordinates
```js
point.x; // Returns the x coordinate
point.y; // Returns the y coordinate
```

##### Retrieving alternate representations
These getters return alternative representations of the given point.
```js
point.stringValue; // Returns a string containing the point's coordinates
point.integerPointValue; // Returns a copy of this point with the coordinate's values truncated to the integer part
point.integerStringValue; // Returns a string containing the point's coordinates truncated to the integer part
```

##### Testing for equality
```js
point1.isEqualToPoint(point2); // Returns YES if the points are equal, otherwise returns NO.
```

##### Point maths
Points contain several convenience methods performing some usual mathematical calculations involving 2D points. These are also available as global functions taking two points. While the `BMPoint` type itself works with cartesian coordinates, these methods make it easier to work with points in polar coordinates.

```ts
point1.distanceToPoint(point2) === BMDistanceBetweenPoints(point1, point2) // Returns the distance between two given points on a 2D plane

point1.slopeAngleToPoint(point2) === BMSlopeAngleBetweenPoints(point1, point2) // Returns the slope angle in radians of the line between two given points
```

### **`BMSize`**

Sizes specify a two-dimensional size. In CoreUI, its main purpose, as its name suggests, is to specify sizes for various elements.

Sizes can be copied using the `copy()` method and also support being interpolated as part of an animation. If one of your custom classes has a size property, it is directly animatable using decorators and animation controllers with no additional implementation required.

##### Creating a size
```js
let size = BMSizeMake(100, 200); // Creates a size with the given dimensions
```

##### Accessing components
```js
size.width; // Returns the width
size.height; // Returns the height
```

##### Testing for equality
```js
size1.isEqualToSize(size2); // Returns YES if the sizes are equal, otherwise returns NO.
```


### **`BMRect`**

A rect represents a rectangle on a 2D plane. Rects are used often in CoreUI to define the layout properties of various elements such as views and collection view cells. A rect is made up of an origin point and a size. The origin point represents the top-left corner of the rectangle while its size represents how much it expands towards the right and bottom. Rects also have several convenience computed properties for accessing their other coordinates such as the right edge or the center point.

Rects can be copied using the `copy()` method and also support being interpolated as part of an animation. If one of your custom classes has a rect property, it is directly animatable using decorators and animation controllers with no additional implementation required.



##### Creating a rect
```js
let rect = BMRectMakeWithOrigin(point, {size: size}); // Creates a rect with the given origin point and size
let rect = BMRectMakeWithX(50, {y: 50, width: 200, height: 160}); // Creates a rect by directly specifying the components of the origin and the size
let rect = BMRectMake(50, 50, 200, 160); // Shorthand notation; the values are the same as the factory function above

let rect = BMRectMakeWithNodeFrame(document.body); // Creates a rect with the given element's bounding client rect; this represents the element's position and size relative to the viewport
```

##### Accessing properties
Normally rects are defined as an origin point and a size, but the rect class provides several properties to access derived coordinates. Some of them are read/write and modifying them will cause the origin and size properties to be modified accordingly.

```js
rect.origin; // Returns the origin point
rect.size; // Returns the size

rect.left; // Returns the left edge of the rect. Readonly.
rect.top; // Returns the top edge of the rect. Readonly.
rect.right; // Returns the right edge of the rect. Readonly.
rect.bottom; // Returns the bottom edge of the rect. Readonly.

rect.width; // Returns the rect's width dimension. Readonly.
rect.height; // Returns the rect's height dimension. Readonly.

rect.center; // Returns or sets the rect's center point.
```


##### Testing for intersection and equality
As they are used heavily throughout CoreUI, rects support certain operations and tests.
```js
rect1.isEqualToRect(rect2); // Returns YES if rect1's origin and size are identical to those of rect2

rect1.intersectsRect(rect2); // Returns YES if the two rects intersect in any point. This method returns YES if the two rects have any edge in common.
rect1.intersectsContentOfRect(rect2); // Returns YES if the two rects intersect in any point. This method returns NO if the two rects only have an edge or corner in common.
rect1.rectByIntersectingWithRect(rect2); // Returns the rect that is obtained by intersecting rect1 with rect2. If the two rects do not intersect, undefined will be returned.

rect1.containsRect(rect2); // Returns YES if rect2 is fully contained by rect1.

rect.containsPoint(point); // Returns YES if the given point is contained within the calling rect.
rect.intersectsPoint(point); // Returns YES if the given point is contained within the calling rect or it is on one of its edges.
```

##### Manipulating the rect
In addition to modifying the origin and size properties directly, rects also offer several helper methods to modify them.
```js
rect.offsetWithX(10, {y: 10}); // Moves the rect's origin point by the given coordinates

rect.insetWithWidth(100, {height: 100}); // Shrinks or expands the rect around its center point by the given width and height dimensions. Positive values shrink the rect while negative values expand it.
rect.insetWithInset(inset); // Applies the insets of the given BMInset object to the rect
```

##### Creating transform rects
Transform rects are rects containing a translation and scale that can be applied to elements that should transition between themselves.
A transform rect's origin represents the translation while its size represents the scale.

In this case there are typically two transforms that should be computed and applied.

```js
let transform = rect1.rectWithTransformToRect(rect2); // Returns the transform rect

// In this example, two transform rects are used to transition from one element to another
// First get the element's frames as rects.
let sourceRect = BMRectMakeWithNodeFrame(sourceNode); // The frame of the source element
let targetRect = BMRectMakeWithNodeFrame(targetNode); // The frame of the target element

// Then compute the transform rects
let sourceTransform = sourceRect.rectWithTransformToRect(targetRect);
let targetTransform = targetRect.rectWithTransformToRect(sourceRect);

// Finally use them to set up the animations
// The source node is transforming to the target node so its opacity should be 0 at the end of the animation
Velocity.animate(sourceNode, {
    translateX: sourceTransform.x + 'px',
    translateY: sourceTransform.y + 'px',
    scaleX: sourceTransform.width,
    scaleY: sourceTransform.height,
    opacity: 0
});

// The target node is transitioning from the source node, so it starts with the transforms applied and animates to no transforms
Velocity.animate(targetNode, {
    translateX: ['0px', targetTransform.x + 'px'],
    translateY: ['0px', targetTransform.y + 'px'],
    scaleX: [1, targetTransform.width],
    scaleY: [1, targetTransform.height],
    opacity: [1, 0]
});

```


### **`Animations`**

Animations are a major part of CoreUI and most of its classes have been created with animations in mind. Internally, CoreUI uses [Velocity.js](velocityjs.org) for animations but has an abstraction layer built atop of it. Its purpose is to allow class properties to be marked as animatable and enables an easier to use animation syntax. While they will be detailed in this document, when working only with the built-in classes, it is typically not needed to know how the animation engine works and many methods create and manage their own animations, but the engine has been made in such a way that other classes can easily integrate with it.

#### Animation basics
Running an animation on an animatable property is as simple as modifying its value while an animation context is active.

Animation contexts are created globally and affect all animatable properties modified while they are active, until they are applied. An animation context is created by invoking the global `BMAnimationBeginWithDuration()` function and applied by invoking the global `BMAnimationApply()` function. Inbetween those two calls, whenever any animatable properties are updated, they will smoothly transition to the new value, using the animation settings of the current context.

Optionally, the `BMAnimationApplyBlocking()` may be used to apply the animation while cancelling any animations currently in progress on any element affected by the current animation context.

```js
// This example modifies a view's frame with an animation
let view = BMView.viewForNode(document.getElementById('myView'));

// The second parameter of this method is an object containing almost all of Velocity.js's supported properties
BMAnimationBeginWithDuration(300, {easing: 'easeInOutQuad'});
view.frame = BMRectMakeWithX(50, {y: 50, width: 300, height: 300});
BMAnimationApply();
```

Alternatively, you may use the block syntax to animate properties in a single call.
```js
// This example modifies a view's frame with an animation
let view = BMView.viewForNode(document.getElementById('myView'));

BMAnimateWithBlock(() => view.frame = BMRectMakeWithX(50, {y: 50, width: 300, height: 300}), {duration: 300, easing: 'easeInOutQuad'});
```

Finally, the functions `BMAnimationApply()`, `BMAnimationApplyBlocking()` and `BMAnimateWithBlock()` all return a promise that resolve when the entire animation finishes running. This makes it easy to perform work that depends on the animation finishing or chaining animation while avoiding the typical callback hell of older javascript versions.
```js
// This code is expected to be run within an async function
// This animation draws attention to a view by making it bigger and then returns it to its original size
let view = BMView.viewForNode(document.getElementById('myView'));

let initialFrame = view.frame.copy();
let attentionFrame = initialFrame.copy();
attentionFrame.insetWithWidth(-100, {height: -100});

// Now animate to the attention frame
await BMAnimateWithBlock(() => view.frame = attentionFrame, {duration: 150, easing: 'easeInQuad'});
// When that animation finishes, animate back to the initial frame
BMAnimateWithBlock(() => view.frame = initialFrame, {duration: 150, easing: 'easeInOutQuad'});
```


#### Supporting CoreUI animations

Most CoreUI classes have several properties that are animatable. This is indicated in the description of the properties. All animatable properties support being animated using animation contexts as described above.

##### Animatable types

In CoreUI, an animatable type is a type that can be animated from one value to another. In TypeScript, this is achieved by implementing the `BMAnimating` interface that ships with the CoreUI definitions file. In JavaScript, any type that implements the `interpolatedValueWithFraction(_, {toValue})` method is animatable.

##### Animation decorators

Class properties that are of an animatable type can be made animatable in TypeScript by using one of the two `@BMAnimatable` and `@BMAnimatableNumber` decorators. These may be applied to properties to easily make them animatable as long as they are numbers or types that implement the `BMAnimating` interface. For animatable properties, classes need only specify what happens when the property is updated; CoreUI handles storage, detecting animation contexts and setting up value interpolation. In particular, marking a property as animatable in this way will cause the class to gain an underscore-prefixed property of the same name that is used internally for storage.
```ts
class MyClass {
    // The annotation marks the backgroundColor property as animatable with CoreUI.
    // Setting this property while an animation context is active will cause this
    // change to be animated without any other code required
    @BMAnimatable
    set backgroundColor(value: BMColor) {
        document.body.style.backgroundColor = value.RGBAString;
    }

    setBackgroundColorAnimated(color: BMColor): void {
        BMAnimateWithBlock(_ => this.backgroundColor = color, {duration: 300});
    }
}
```

##### `BMAnimationController`
The new controller class makes it easy to integrate with the CoreUI animation engine and is the recommended way to integrate with the animation engine in environments where decorators are not supported or if animating the property is more complex than can be achieved using only a single animatable type. Animation subscribers provide methods to automatically interpolate values or even update their target's properties. They work with standard CSS/Velocity.js properties, numeric properties, `BMAnimating` properties or even arbitrary properties.

The animation decorators make use of animation controllers behind the scenes.

Animation controllers are attached to an existing animation context and always reference a DOM node which will be animated.

###### Obtaining an animation controller

Animation controllers are not created using a constructor or factory function, instead they are created by the current animation context. The current animation context, if any can be retrieved by invoking the global `BMAnimationContextGetCurrent()` function. From that, the `controllerForObject(_, {node})` method should be invoked to retrieve or create the animation controller associated with a given object. Typically that object is the calling object.

```js
let context = BMAnimationContextGetCurrent(); // Retrieve the current animation context. Note that this will be undefined if there is no current animation context.

if (context) {
    // Obtain an animation controller. If this object has previously requested an animation controller from this animation context, the previous instance will be returned
    let controller = context.controllerForObject(this, {node: document.body});
}
```

###### Registering an animation with the controller

The animation controller can be used to register various animations that will run with the current context's settings. Unless specified, the animations will affect the node that was specified when requesting the animation controller.

```js
// Register an animation that will horizontally scale the node to twice its regular size
context.registerBuiltInProperty('scaleX', {withValue: 2});

// Register an animation that will run on the given animatable property. This property is expected to exist on the object that was used when requesting the animation controller. Note that the starting value is optional and will use the property's current value if not specified.
context.registerAnimatableProperty('backgroundColor', {starting: BMColorMakeWithString('yellow'), targetValue: BMColorMakeWithString('red')});

// Register an animation that will run on the given number property. This property is expected to exist on the object that was used when requesting the animation controller. Note that the starting value is optional and will use the property's current value if not specified.
context.registerOwnProperty('fraction', {starting: 1, targetValue: 2});

// Register an animation that will run with a custom interpolation. In this case, a callback function will be repeatedly invoked, receiving information about the animation progress. Two optional starting and target values may be specified together and will be interpolated by CoreUI and passed to the callback function. In this case, the property is not expected to exist on the controller's object.
context.registerCustomProperty('example', {withHandler: (fraction, value) => {
    document.body.style.boxShadow = `0px 0px ${value}px rgba(0, 0, 0, ${fraction})`;
}, startingValue: 0, targetValue: 4});
```

The following example shows how to make a property animatable using an animation controller.

```ts
class MyClass {
    _myProperty: number;
    get myProperty(): number {
        return this._myProperty;
    }
    set myProperty(value: number) {
        if (let animation = BMAnimationContextGetCurrent()) {
            // If animation context is active obtain the animation controller for this object
            let controller = animation.controllerForObject(this, {node: document.body});
            // Then use it to register an animation for the myProperty property
            controller.registerOwnProperty('myProperty', {targetValue: value});
        }
        else {
            // Otherwise just set the value
            this._myProperty = value;
        }
    }
}
```

### **`BMIndexPath`**

An index path represents a sequence of indexes that must be followed to reach an object in a series of nested arrays. It can contain as many indexes as needed to reach the given object, but typically in CoreUI only two are used. The first index represents the section to which the object belongs and the second matches the object's position within its section. Index paths are used extensively by Collection View and are an abstractization which allows Collection View to interact with data without defining any particular data storage mechanism. It is up to the underlying implementation to store objects as needed - Collection View always requests index paths corresponding to objects and never access to the data structures themselves.

Index paths also contain an optional reference to the object. In Collection View this is only used to verify the identity of the object and to compute changes in the data structures as they would appear in Collection View. It is not guaranteed that this reference points to the current state of the given object, only that comparing this reference to the current reference will return true when using Collection View's identity comparator.

Index paths can also be copied using the `copy()` method.

##### Creating an index path
```js
let indexPath = BMIndexPathMakeWithIndexes([0, 5, 13], {forObject: myObject}); // Creates an index path with as many indexes as needed
let indexPath = BMIndexPathMakeWithRow(3, {section: 5, forObject: myObject}); // Creates an index path with two indexes - typically used when interacting with Collection View
```

##### Properties
The parameters used when constructing index paths are available afterwards as properties.
```js
indexPath.section; // Returns the first index
indexPath.row; // Returns the second index
indexPath.object; // Returns the object reference
indexPath.indexes[i]; // Returns a specific index
```

##### Testing for equality
A key feature of index paths is testing for equality. This is used by Collection View to compute data set changes when it is notified of an update. The comparison involves also testing the object references for identity. In this case, the objects are considered to be identical based on arbitrary criteria specified by a callback function and are not required to actually be equal - if they are not equal but they are identical, they are considered to be different states of the same object. There are two types of equalities used for index path:
 - **Strict equality** requires two index paths to have the same indexes and point to identical objects in order to be equal.
 - **Loose equality** requires two index paths to point to identical objects, but they may be in different positions.
 
 ```js
 firstIndexPath.isEqualToIndexPath(indexPath2, {usingComparator: (object1, object2) => object1.identifier === object2.identifier}); // Strict equality check with an inline comparator

 firstIndexPath.isLooselyEqualToIndexPath(indexPath2, {usingComparator: collectionView.identityComparator}); // Loose equality check with a comparator reference
 ```

A special globally available `BMIndexPathNone` may be used in certain cases where a valid index path may not obtained but undefined is not an acceptable value. Typically this is only returned by a handful of CoreUI methods and cannot be used as a valid parameter elsewhere. `BMIndexPathNone` returns `false` when tested for equality against any index path, including itself.